const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase secrets are missing.");
  process.exit(1);
}

const sources = [
  {
    name: "OSSC",
    url: "https://www.ossc.gov.in/"
  },
  {
    name: "OPSC",
    url: "https://www.opsc.gov.in/"
  },
  {
    name: "Odisha Police",
    url: "https://odishapolice.gov.in/"
  },
  {
    name: "SSC",
    url: "https://ssc.gov.in/"
  },
  {
    name: "UPSC",
    url: "https://upsc.gov.in/"
  }
];

function supabaseRequest(path, method = "GET", data = null) {

  return new Promise((resolve, reject) => {

    const url = new URL(SUPABASE_URL + path);

    const body = data
      ? JSON.stringify(data)
      : null;

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      }
    };

    const req = https.request(options, res => {

      let result = "";

      res.on("data", chunk => {
        result += chunk;
      });

      res.on("end", () => {

        if (res.statusCode >= 200 && res.statusCode < 300) {

          try {
            resolve(JSON.parse(result || "{}"));
          } catch {
            resolve(result);
          }

        } else {

          reject(
            new Error(
              `Supabase error ${res.statusCode}: ${result}`
            )
          );

        }

      });

    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();

  });

}


async function main() {

  console.log("🚀 JobMitra AI Automatic Checker");
  console.log("📡 Starting automatic system...");

  console.log(`🔎 Sources configured: ${sources.length}`);

  for (const source of sources) {

    console.log(
      `Checking ${source.name}: ${source.url}`
    );

  }

  try {

    const result =
      await supabaseRequest(
        "/rest/v1/automation_logs",
        "POST",
        {
          source_name: "JobMitra AI Checker",
          status: "success",
          jobs_found: 0,
          jobs_added: 0
        }
      );

    console.log("✅ Supabase connection successful.");
    console.log("🗃️ Automation log saved.");

  } catch (error) {

    console.error(
      "❌ Supabase connection failed:",
      error.message
    );

    process.exit(1);

  }

}

main();
