// backend/checker.js

const https = require("https");

const SOURCES = [
  {
    name: "UPSC",
    url: "https://www.upsc.gov.in/recruitment/recruitment-advertisement",
  },
];

// ❌ Generic/menu/non-job links
const BLOCKED_WORDS = [
  "skip to main content",
  "skip to content",
  "find counsellor",
  "career tools",
  "advertisements",
  "advertisement",
  "forms for certificates",
  "recruitment tests",
  "recruitment requisition",
  "recruitment cases",
  "representation on question papers",
  "time-frame-representation",
  "pending litigations",
  "login",
  "register",
  "contact us",
  "privacy policy",
  "sitemap",
  "home",
  "search",
  "menu",
  ".pdf",
  "view pdf",
  "download pdf",
];

// ✅ Words strongly suggesting an actual vacancy/notification
const STRONG_JOB_WORDS = [
  "vacancy",
  "vacancies",
  "recruitment notification",
  "recruitment notice",
  "employment notice",
  "job notification",
  "job notice",
  "online application",
  "apply online",
  "application invited",
  "applications are invited",
  "invited for recruitment",
  "posts",
  "post of",
  "appointment to",
  "direct recruitment",
  "special recruitment",
  "junior engineer",
  "assistant engineer",
  "assistant section officer",
  "section officer",
  "junior administrative",
  "scientist",
  "professor",
  "lecturer",
  "officer",
  "clerk",
  "technician",
  "nurse",
  "teacher",
  "constable",
  "inspector",
];

// --------------------------------------------------
// Fetch webpage
// --------------------------------------------------

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",
          },
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(
                new Error(`HTTP ${res.statusCode}: ${url}`)
              );
            }
          });
        }
      )
      .on("error", reject);
  });
}

// --------------------------------------------------
// Clean HTML
// --------------------------------------------------

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// Check blocked content
// --------------------------------------------------

function isBlocked(text) {
  const value = text.toLowerCase();

  return BLOCKED_WORDS.some((word) =>
    value.includes(word.toLowerCase())
  );
}

// --------------------------------------------------
// Check strong job signal
// --------------------------------------------------

function hasStrongJobSignal(text) {
  const value = text.toLowerCase();

  return STRONG_JOB_WORDS.some((word) =>
    value.includes(word.toLowerCase())
  );
}

// --------------------------------------------------
// Extract links
// --------------------------------------------------

function extractLinks(html, sourceUrl) {
  const results = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    let href = match[1];
    const title = cleanText(match[2]);

    if (!title || title.length < 8) {
      continue;
    }

    // Convert relative URL to absolute URL
    try {
      href = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    const combined = `${title} ${href}`.toLowerCase();

    // ❌ Reject blocked links
    if (isBlocked(combined)) {
      continue;
    }

    // ❌ Reject homepage
    try {
      const linkUrl = new URL(href);
      const source = new URL(sourceUrl);

      if (
        linkUrl.hostname === source.hostname &&
        (linkUrl.pathname === "/" ||
          linkUrl.pathname === "")
      ) {
        continue;
      }
    } catch {
      continue;
    }

    // ❌ Recruitment alone is NOT enough
    // Must contain a stronger job signal
    if (!hasStrongJobSignal(combined)) {
      continue;
    }

    results.push({
      title,
      url: href,
    });
  }

  return results;
}

// --------------------------------------------------
// Remove duplicates
// --------------------------------------------------

function removeDuplicates(items) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = item.url.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

// --------------------------------------------------
// Main checker
// --------------------------------------------------

async function runChecker() {
  console.log("");
  console.log("🚀 JobMitra AI - Automatic Job Checker");
  console.log("");
  console.log("🇮🇳 India + 🟢 Odisha + 🏢 Government Jobs");
  console.log("");

  for (const source of SOURCES) {
    console.log(`🌐 Checking ${source.name}...`);
    console.log("");

    try {
      const html = await fetchPage(source.url);

      console.log(
        `✅ ${source.name} loaded: ${Buffer.byteLength(
          html,
          "utf8"
        )} bytes`
      );

      const jobs = extractLinks(html, source.url);
      const uniqueJobs = removeDuplicates(jobs);

      console.log("");
      console.log(
        `🔎 ${source.name}: ${uniqueJobs.length} genuine job links found`
      );
      console.log("");

      console.log("📋 FILTERED JOBS");
      console.log("------------------------------");

      if (uniqueJobs.length === 0) {
        console.log("No genuine job notification links found.");
      } else {
        uniqueJobs.forEach((job, index) => {
          console.log(`${index + 1}. ${job.title}`);
          console.log(`   ${job.url}`);
          console.log("");
        });
      }

      console.log("------------------------------");
      console.log(
        `✅ ${uniqueJobs.length} jobs passed strict filter`
      );
      console.log("");

      // ⚠️ Database/push update intentionally disabled.
      // First verify the filtering result.
    } catch (error) {
      console.error(
        `❌ ${source.name} error: ${error.message}`
      );
    }
  }

  console.log("🏁 Checker finished.");
  console.log("");
}

runChecker();
