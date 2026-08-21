// backend/checker.js

const https = require("https");

const SOURCES = [
  {
    name: "UPSC",
    url: "https://www.upsc.gov.in/recruitment/recruitment-advertisement",
  },
];

// ❌ Ei words thile job hisabare save karibani
const BLOCKED_WORDS = [
  "advertisement",
  "advertisements",
  "find counsellor",
  "counsellor",
  "career tools",
  "skip to main content",
  "skip to content",
  "view pdf",
  "pdf",
  "download",
  "home",
  "contact us",
  "login",
  "register",
  "menu",
  "search",
  "privacy policy",
  "sitemap",
];

// ✅ Job-related words
const JOB_WORDS = [
  "recruitment",
  "vacancy",
  "vacancies",
  "job",
  "jobs",
  "post",
  "posts",
  "appointment",
  "notification",
  "recruit",
  "recruitment notice",
  "employment",
  "junior engineer",
  "engineer",
  "assistant",
  "officer",
  "clerk",
  "technician",
  "nurse",
  "teacher",
  "constable",
  "inspector",
  "scientist",
  "professor",
  "staff",
  "group a",
  "group b",
  "group c",
  "group d",
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
                new Error(
                  `HTTP ${res.statusCode}: ${url}`
                )
              );
            }
          });
        }
      )
      .on("error", reject);
  });
}

// --------------------------------------------------
// Remove HTML
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
// Check blocked words
// --------------------------------------------------

function isBlocked(text) {
  const value = text.toLowerCase();

  return BLOCKED_WORDS.some((word) =>
    value.includes(word.toLowerCase())
  );
}

// --------------------------------------------------
// Check genuine job content
// --------------------------------------------------

function isJob(text) {
  const value = text.toLowerCase();

  if (isBlocked(value)) {
    return false;
  }

  return JOB_WORDS.some((word) =>
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
    const rawText = match[2];

    const text = cleanText(rawText);

    if (!text || text.length < 5) {
      continue;
    }

    // Convert relative URL to absolute URL
    try {
      href = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    const combinedText = `${text} ${href}`;

    // ❌ Remove unwanted links
    if (isBlocked(combinedText)) {
      continue;
    }

    // ❌ Must contain job-related word
    if (!isJob(combinedText)) {
      continue;
    }

    results.push({
      title: text,
      url: href,
    });
  }

  return results;
}

// --------------------------------------------------
// Remove duplicate jobs
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

      if (uniqueJobs.length === 0) {
        console.log("⚠️ No genuine job links found.");
        console.log("");
        continue;
      }

      console.log("📋 FILTERED JOBS");
      console.log("------------------------------");

      uniqueJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title}`);
        console.log(`   ${job.url}`);
        console.log("");
      });

      console.log("------------------------------");
      console.log(
        `✅ ${uniqueJobs.length} jobs passed strict filter`
      );
      console.log("");

      // IMPORTANT:
      // Ebe database/push update intentionally karunahin.
      // First filter result verify kariba.
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
