const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase secrets are missing.");
  process.exit(1);
}

const OSSC_URL = "https://www.ossc.gov.in/";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent": "JobMitraAI-AutomaticChecker/1.0"
        }
      },
      response => {
        let data = "";

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode >= 200 &&
              response.statusCode < 400) {
            resolve(data);
          } else {
            reject(
              new Error(
                `OSSC HTTP ${response.statusCode}`
              )
            );
          }
        });
      }
    ).on("error", reject);
  });
}

function supabaseRequest(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {

    const url = new URL(SUPABASE_URL + path);

    const body = data ? JSON.stringify(data) : null;

    const request = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        }
      },

      response => {

        let result = "";

        response.on("data", chunk => {
          result += chunk;
        });

        response.on("end", () => {

          if (
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            try {
              resolve(JSON.parse(result || "{}"));
            } catch {
              resolve(result);
            }
          } else {
            reject(
              new Error(
                `Supabase ${response.statusCode}: ${result}`
              )
            );
          }

        });

      }
    );

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

function makeFingerprint(title, url) {
  return Buffer
    .from(`${title}|${url}`)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 200);
}

async function main() {

  console.log("🚀 JobMitra AI - Odisha Automatic Checker");

  try {

    console.log("🔎 Checking official OSSC website...");

    const html = await fetchPage(OSSC_URL);

    console.log(
      `✅ OSSC website reached. HTML size: ${html.length} bytes`
    );

    /*
      We currently collect recruitment-related links
      from the official OSSC homepage.

      Only links containing recruitment/job/advertisement/
      notification keywords are considered.
    */

    const linkRegex =
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    const foundJobs = [];

    let match;

    while ((match = linkRegex.exec(html)) !== null) {

      const href = match[1];
      const rawTitle = match[2];

      const title = cleanText(
        rawTitle.replace(/<[^>]+>/g, " ")
      );

      const combined =
        `${title} ${href}`.toLowerCase();

      const isRecruitment =
        combined.includes("recruit") ||
        combined.includes("advertisement") ||
        combined.includes("vacancy") ||
        combined.includes("job");

      if (!isRecruitment) {
        continue;
      }

      let officialUrl = href;

      if (href.startsWith("/")) {
        officialUrl = `https://www.ossc.gov.in${href}`;
      }

      if (!officialUrl.startsWith("http")) {
        continue;
      }

      if (!title || title.length < 5) {
        continue;
      }

      foundJobs.push({
        title,
        officialUrl
      });
    }

    console.log(
      `📋 Recruitment-related links found: ${foundJobs.length}`
    );

    let added = 0;

    for (const job of foundJobs) {

      const fingerprint =
        makeFingerprint(
          job.title,
          job.officialUrl
        );

      const existing =
        await supabaseRequest(
          `/rest/v1/jobs?fingerprint=eq.${encodeURIComponent(fingerprint)}&select=id`
        );

      if (Array.isArray(existing) &&
          existing.length > 0) {

        console.log(
          `⏭️ Already exists: ${job.title}`
        );

        continue;
      }

      await supabaseRequest(
        "/rest/v1/jobs",
        "POST",
        {
          title: job.title,
          organization: "Odisha Staff Selection Commission",
          category: "Jobs",
          official_url: job.officialUrl,
          source_url: OSSC_URL,
          source_name: "OSSC",
          fingerprint,
          is_verified: true,
          is_active: true
        }
      );

      await supabaseRequest(
        "/rest/v1/notifications",
        "POST",
        {
          title: `New OSSC Update: ${job.title}`,
          message:
            "New official OSSC recruitment-related update found.",
          type: "Jobs",
          official_url: job.officialUrl,
          is_active: true
        }
      );

      added++;

      console.log(
        `🆕 Added: ${job.title}`
      );
    }

    await supabaseRequest(
      "/rest/v1/automation_logs",
      "POST",
      {
        source_name: "OSSC",
        status: "success",
        jobs_found: foundJobs.length,
        jobs_added: added
      }
    );

    console.log(
      `✅ OSSC check completed. Added: ${added}`
    );

  } catch (error) {

    console.error(
      "❌ Automatic checker failed:",
      error.message
    );

    try {
      await supabaseRequest(
        "/rest/v1/automation_logs",
        "POST",
        {
          source_name: "OSSC",
          status: "error",
          jobs_found: 0,
          jobs_added: 0,
          error_message: error.message
        }
      );
    } catch {}

    process.exit(1);
  }
}

main();
