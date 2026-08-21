// backend/checker.js

const https = require("https");

const SOURCES = [
  {
    name: "UPSC",
    url: "https://www.upsc.gov.in/recruitment/recruitment-advertisement",
  },
];

// Words that should NEVER become jobs
const BLOCKED_WORDS = [
  "skip to main content",
  "skip to content",
  "find counsellor",
  "career tools",
  "forms for certificates",
  "recruitment tests",
  "recruitment requisition",
  "pending litigations",
  "representation on question papers",
  "time-frame-representation",
  "view pdf",
  "download pdf",
  "privacy policy",
  "sitemap",
  "contact us",
  "login",
  "register",
];

// Strong job signals
const JOB_WORDS = [
  "vacancy",
  "vacancies",
  "notification",
  "notice",
  "online application",
  "apply online",
  "application invited",
  "applications are invited",
  "posts",
  "post of",
  "recruitment",
  "appointment",
  "direct recruitment",
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
  "lecturer",
];

// --------------------------------------------------
// Fetch page
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
// Clean HTML
// --------------------------------------------------

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// Find blocked word
// --------------------------------------------------

function getBlockedWord(text) {
  const value = text.toLowerCase();

  for (const word of BLOCKED_WORDS) {
    if (value.includes(word.toLowerCase())) {
      return word;
    }
  }

  return null;
}

// --------------------------------------------------
// Find job word
// --------------------------------------------------

function getJobWord(text) {
  const value = text.toLowerCase();

  for (const word of JOB_WORDS) {
    if (value.includes(word.toLowerCase())) {
      return word;
    }
  }

  return null;
}

// --------------------------------------------------
// Extract links + DEBUG
// --------------------------------------------------

function extractLinks(html, sourceUrl) {
  const results = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  let count = 0;

  console.log("");
  console.log("🔍 DEBUG LINK ANALYSIS");
  console.log("==============================");

  while ((match = regex.exec(html)) !== null) {
    count++;

    let href = match[1];
    const title = cleanText(match[2]);

    if (!title || title.length < 3) {
      continue;
    }

    try {
      href = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    const combined = `${title} ${href}`;
    const blockedWord = getBlockedWord(combined);
    const jobWord = getJobWord(combined);

    // Print first 100 links only
    if (count <= 100) {
      console.log("");
      console.log(`LINK ${count}`);
      console.log(`TITLE : ${title}`);
      console.log(`URL   : ${href}`);

      if (blockedWord) {
        console.log(`❌ REJECTED`);
        console.log(`   Reason: blocked word = "${blockedWord}"`);
        continue;
      }

      if (!jobWord) {
        console.log(`❌ REJECTED`);
        console.log(`   Reason: no job keyword found`);
        continue;
      }

      console.log(`🟢 ACCEPTED`);
      console.log(`   Job keyword = "${jobWord}"`);
    }

    // Apply filter
    if (blockedWord) {
      continue;
    }

    if (!jobWord) {
      continue;
    }

    results.push({
      title,
      url: href,
    });
  }

  console.log("");
  console.log("==============================");
  console.log(`🔍 Total links scanned: ${count}`);
  console.log("==============================");

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
// Main
// --------------------------------------------------

async function runChecker() {
  console.log("");
  console.log("🚀 JobMitra AI - DEBUG JOB CHECKER");
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
      console.log("📋 ACCEPTED JOB LINKS");
      console.log("==============================");

      if (uniqueJobs.length === 0) {
        console.log("⚠️ No links accepted.");
      } else {
        uniqueJobs.forEach((job, index) => {
          console.log("");
          console.log(`${index + 1}. ${job.title}`);
          console.log(`   ${job.url}`);
        });
      }

      console.log("");
      console.log("==============================");
      console.log(
        `✅ Accepted: ${uniqueJobs.length}`
      );
      console.log("==============================");
    } catch (error) {
      console.error(
        `❌ ${source.name} error: ${error.message}`
      );
    }
  }

  console.log("");
  console.log("🏁 Debug checker finished.");
  console.log("");
}

runChecker();
