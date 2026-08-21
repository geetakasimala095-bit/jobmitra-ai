// backend/checker.js

const https = require("https");

const SOURCES = [
  {
    name: "UPSC",
    url: "https://www.upsc.gov.in/recruitment/recruitment-advertisement",
  },
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
// Clean HTML text
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
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// Check genuine UPSC advertisement PDF
// --------------------------------------------------

function isGenuineAdvertisement(url, title) {
  const value = `${url} ${title}`.toLowerCase();

  // Must be a PDF
  if (!value.includes(".pdf")) {
    return false;
  }

  // Must look like an official UPSC uploaded file
  if (!url.includes("upsc.gov.in")) {
    return false;
  }

  // UPSC advertisement files normally contain AdvtNo
  if (!value.includes("advtno")) {
    return false;
  }

  // Reject unrelated files
  const blocked = [
    "question",
    "syllabus",
    "answer-key",
    "calendar",
    "forms",
    "certificate",
    "model",
    "demo",
    "policy",
  ];

  for (const word of blocked) {
    if (value.includes(word)) {
      return false;
    }
  }

  return true;
}

// --------------------------------------------------
// Create readable job title
// --------------------------------------------------

function createJobTitle(url, originalTitle) {
  const filename = url.split("/").pop();

  const match = filename.match(
    /AdvtNo-([0-9]+)-([0-9]{4})/i
  );

  if (match) {
    return `UPSC Recruitment Advertisement - Advt No. ${match[1]}/${match[2]}`;
  }

  return `UPSC Recruitment Advertisement - ${originalTitle}`;
}

// --------------------------------------------------
// Extract ONLY genuine advertisement PDFs
// --------------------------------------------------

function extractJobs(html, sourceUrl) {
  const results = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  let total = 0;

  console.log("");
  console.log("🔍 UPSC ADVERTISEMENT FILTER");
  console.log("==============================");

  while ((match = regex.exec(html)) !== null) {
    total++;

    let href = match[1];
    const title = cleanText(match[2]);

    if (!title && !href) {
      continue;
    }

    try {
      href = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    // Only inspect PDF links
    if (!href.toLowerCase().includes(".pdf")) {
      continue;
    }

    console.log("");
    console.log(`PDF LINK ${total}`);
    console.log(`TITLE : ${title}`);
    console.log(`URL   : ${href}`);

    if (isGenuineAdvertisement(href, title)) {
      const jobTitle = createJobTitle(href, title);

      console.log("🟢 ACCEPTED — Genuine advertisement PDF");
      console.log(`JOB   : ${jobTitle}`);

      results.push({
        title: jobTitle,
        url: href,
        source: "UPSC",
      });
    } else {
      console.log("❌ REJECTED — Not a recruitment advertisement");
    }
  }

  console.log("");
  console.log("==============================");
  console.log(`🔍 Total HTML links scanned: ${total}`);
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
    if (seen.has(item.url)) {
      continue;
    }

    seen.add(item.url);
    output.push(item);
  }

  return output;
}

// --------------------------------------------------
// Main checker
// --------------------------------------------------

async function runChecker() {
  console.log("");
  console.log("🚀 JobMitra AI - UPSC JOB CHECKER");
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

      const jobs = extractJobs(html, source.url);
      const uniqueJobs = removeDuplicates(jobs);

      console.log("");
      console.log("📋 GENUINE JOB ADVERTISEMENTS");
      console.log("==============================");

      if (uniqueJobs.length === 0) {
        console.log("⚠️ No genuine advertisement PDF found.");
      } else {
        uniqueJobs.forEach((job, index) => {
          console.log("");
          console.log(`${index + 1}. ${job.title}`);
          console.log(`   ${job.url}`);
        });
      }

      console.log("");
      console.log("==============================");
      console.log(`✅ Genuine jobs found: ${uniqueJobs.length}`);
      console.log("==============================");

      // ⚠️ Supabase/PUSH intentionally disabled.
      // First verify the result.
    } catch (error) {
      console.error(
        `❌ ${source.name} error: ${error.message}`
      );
    }
  }

  console.log("");
  console.log("🏁 Checker finished.");
  console.log("");
}

runChecker();
