const https = require("https");
const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase secrets are missing.");
  process.exit(1);
}

const OSSC_URL = "https://ossc.gov.in/Public/OSSC/Default.aspx";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; JobMitraAI/1.0)"
        }
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (
            response.statusCode >= 200 &&
            response.statusCode < 400
          ) {
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
    );

    request.setTimeout(30000, () => {
      request.destroy(
        new Error("OSSC request timed out")
      );
    });

    request.on("error", reject);
  });
}

function supabaseRequest(
  path,
  method = "GET",
  data = null
) {
  return new Promise((resolve, reject) => {
    const url = new URL(
      SUPABASE_URL + path
    );

    const body = data
      ? JSON.stringify(data)
      : null;

    const request = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,

        headers: {
          "apikey": SUPABASE_KEY,

          "Authorization":
            `Bearer ${SUPABASE_KEY}`,

          "Content-Type":
            "application/json",

          "Prefer":
            "return=representation"
        }
      },

      (response) => {
        let result = "";

        response.on("data", (chunk) => {
          result += chunk;
        });

        response.on("end", () => {
          if (
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            try {
              resolve(
                JSON.parse(result || "[]")
              );
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
  return String(text)
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(href) {
  try {
    return new URL(
      href,
      "https://ossc.gov.in/"
    ).href;
  } catch {
    return null;
  }
}

function makeFingerprint(title, url) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${url}`)
    .digest("hex");
}

function isJobRelated(title, href) {
  const text =
    `${title} ${href}`.toLowerCase();

  const positive = [
    "advertisement",
    "recruitment",
    "recruit",
    "vacancy",
    "post",
    "appointment",
    "combined",
    "selection",
    "examination",
    "career",
    "notification"
  ];

  const negative = [
    "answer key",
    "answer-key",
    "admit card",
    "admission letter",
    "result",
    "rejection",
    "objection",
    "question paper",
    "mock test"
  ];

  const hasPositive =
    positive.some((word) =>
      text.includes(word)
    );

  const hasNegative =
    negative.some((word) =>
      text.includes(word)
    );

  return hasPositive && !hasNegative;
}

function extractLinks(html) {
  const results = [];

  const regex =
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match = regex.exec(html)) !== null
  ) {
    const href = match[1];
    const title = cleanText(match[2]);

    if (!title || title.length < 8) {
      continue;
    }

    const officialUrl =
      absoluteUrl(href);

    if (!officialUrl) {
      continue;
    }

    if (
      !isJobRelated(
        title,
        officialUrl
      )
    ) {
      continue;
    }

    results.push({
      title,
      officialUrl
    });
  }

  return results;
}

async function saveJob(job) {
  const fingerprint =
    makeFingerprint(
      job.title,
      job.officialUrl
    );

  const existing =
    await supabaseRequest(
      `/rest/v1/jobs?fingerprint=eq.${encodeURIComponent(
        fingerprint
      )}&select=id`
    );

  if (
    Array.isArray(existing) &&
    existing.length > 0
  ) {
    console.log(
      `⏭️ Already exists: ${job.title}`
    );

    return false;
  }

  await supabaseRequest(
    "/rest/v1/jobs",
    "POST",
    {
      title: job.title,

      organization:
        "Odisha Staff Selection Commission",

      category: "Jobs",

      official_url:
        job.officialUrl,

      source_url:
        OSSC_URL,

      source_name:
        "OSSC",

      fingerprint,

      is_verified: true,

      is_active: true
    }
  );

  await supabaseRequest(
    "/rest/v1/notifications",
    "POST",
    {
      title:
        `New OSSC Job: ${job.title}`,

      message:
        "New recruitment-related update found on the official OSSC website.",

      type: "Jobs",

      official_url:
        job.officialUrl,

      is_active: true
    }
  );

  console.log(
    `🆕 Added: ${job.title}`
  );

  return true;
}

async function main() {
  console.log(
    "🚀 JobMitra AI - OSSC Automatic Checker"
  );

  try {
    console.log(
      "🌐 Fetching official OSSC page..."
    );

    const html =
      await fetchPage(OSSC_URL);

    console.log(
      `✅ OSSC page loaded: ${html.length} bytes`
    );

    const jobs =
      extractLinks(html);

    console.log(
      `🔎 Possible recruitment links: ${jobs.length}`
    );

    let added = 0;

    for (const job of jobs) {
      try {
        const wasAdded =
          await saveJob(job);

        if (wasAdded) {
          added++;
        }
      } catch (error) {
        console.error(
          `❌ Failed to save "${job.title}":`,
          error.message
        );
      }
    }

    await supabaseRequest(
      "/rest/v1/automation_logs",
      "POST",
      {
        source_name: "OSSC",

        status: "success",

        jobs_found:
          jobs.length,

        jobs_added:
          added
      }
    );

    console.log(
      "================================="
    );

    console.log(
      `📋 Found: ${jobs.length}`
    );

    console.log(
      `🆕 Added: ${added}`
    );

    console.log(
      "✅ OSSC automatic check completed."
    );

  } catch (error) {
    console.error(
      "❌ Checker failed:",
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

          error_message:
            error.message
        }
      );
    } catch (logError) {
      console.error(
        "⚠️ Could not write automation log:",
        logError.message
      );
    }

    process.exit(1);
  }
}

main();
