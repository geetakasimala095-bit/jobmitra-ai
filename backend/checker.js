// backend/checker.js
// ============================================================
// JobMitra AI - Automatic Job Checker
// NCS SERVICE PAGES REMOVED
// Odisha Govt + All India Govt + Private Jobs
// Recruitment + Admit Card + Important Job Notices
// Supabase Auto Update
// ============================================================

const https = require("https");
const http = require("http");

// ------------------------------------------------------------
// SUPABASE
// ------------------------------------------------------------

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://hsexaatuacdnumxnkehx.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY is missing."
  );
  console.error(
    "GitHub Actions → Settings → Secrets and variables → Actions"
  );
  process.exit(1);
}


// ------------------------------------------------------------
// SOURCES
// ------------------------------------------------------------

const SOURCES = [

  // ================= INDIA GOVT =================

  {
    name: "UPSC",
    category: "All India Government Jobs",
    type: "government",
    url:
      "https://www.upsc.gov.in/recruitment/recruitment-advertisement"
  },

  {
    name: "SSC",
    category: "All India Government Jobs",
    type: "government",
    url:
      "https://ssc.gov.in/home/candidate-portal"
  },

  // ================= ODISHA GOVT =================

  {
    name: "OSSC",
    category: "Odisha Government Jobs",
    type: "government",
    url:
      "https://www.ossc.gov.in/Public/OSSC/Default.aspx"
  },

  {
    name: "OPSC",
    category: "Odisha Government Jobs",
    type: "government",
    url:
      "https://opsc.gov.in/Public/OPSC/Default.aspx"
  },

  {
    name: "Odisha Police",
    category: "Odisha Government Jobs",
    type: "government",
    url:
      "https://odishapolice.gov.in/"
  },

  // ================= PRIVATE =================
  // These are general private-job sources.
  // If a website blocks automated requests, it will be skipped.

  {
    name: "Indeed",
    category: "Private Jobs",
    type: "private",
    url:
      "https://in.indeed.com/jobs?q=private+jobs&l=India"
  },

  {
    name: "Freshersworld",
    category: "Private Jobs",
    type: "private",
    url:
      "https://www.freshersworld.com/jobs"
  }

];


// ------------------------------------------------------------
// USER AGENT
// ------------------------------------------------------------

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/151.0 Safari/537.36 JobMitraAI/1.0";


// ------------------------------------------------------------
// FETCH PAGE
// ------------------------------------------------------------

function fetchPage(url) {

  return new Promise((resolve, reject) => {

    let client = https;

    if (url.startsWith("http://")) {
      client = http;
    }

    const request =
      client.get(
        url,
        {
          headers: {
            "User-Agent": USER_AGENT,
            "Accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language":
              "en-IN,en;q=0.9"
          },
          timeout: 30000
        },
        (res) => {

          let data = "";

          res.setEncoding("utf8");

          res.on("data", chunk => {
            data += chunk;
          });

          res.on("end", () => {

            if (
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {

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
      );

    request.on("timeout", () => {

      request.destroy(
        new Error("Request timeout")
      );

    });

    request.on("error", reject);

  });

}


// ------------------------------------------------------------
// CLEAN HTML
// ------------------------------------------------------------

function cleanText(html) {

  return String(html || "")
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// ------------------------------------------------------------
// NORMALIZE URL
// ------------------------------------------------------------

function normalizeUrl(href, sourceUrl) {

  try {

    return new URL(
      href,
      sourceUrl
    ).href;

  } catch {

    return "";

  }

}


// ------------------------------------------------------------
// BLOCKED NCS / UNWANTED SERVICE WORDS
// ------------------------------------------------------------

const BLOCKED_WORDS = [

  "career center",

  "find career center",

  "find counsellor",

  "career counsellor",

  "employment exchange",

  "list of employment exchange",

  "model career center",

  "list of model career center",

  "job fair",

  "job fairs",

  "job fairs and events",

  "participate in a job fair",

  "create job fairs",

  "career tools",

  "career tools & learning",

  "find candidates",

  "international jobs through e-migrate",

  "e-migrate",

  "recruitment agencies/international employer",

  "jobs for ex-servicemen",

  "jobs for differently abled",

  "career guidance",

  "career counselling",

  "counselling services"

];


// ------------------------------------------------------------
// JOB KEYWORDS
// ------------------------------------------------------------

const JOB_KEYWORDS = [

  "recruitment",

  "vacancy",

  "vacancies",

  "job",

  "jobs",

  "advertisement",

  "notification",

  "appointment",

  "hiring",

  "post",

  "posts",

  "apply",

  "application",

  "selection",

  "employment",

  "career",

  "assistant",

  "officer",

  "engineer",

  "teacher",

  "lecturer",

  "professor",

  "clerk",

  "constable",

  "inspector",

  "technician",

  "manager",

  "executive",

  "trainee"

];


// ------------------------------------------------------------
// ADMIT CARD / STUDENT NOTICE KEYWORDS
// ------------------------------------------------------------

const NOTICE_KEYWORDS = [

  "admit card",

  "admission letter",

  "hall ticket",

  "exam notice",

  "examination notice",

  "recruitment notice",

  "recruitment advertisement",

  "answer key",

  "result",

  "selection list",

  "merit list",

  "shortlisted",

  "document verification",

  "skill test",

  "written examination"

];


// ------------------------------------------------------------
// CHECK BLOCKED
// ------------------------------------------------------------

function isBlocked(text) {

  const value =
    String(text || "")
      .toLowerCase();

  return BLOCKED_WORDS.some(
    word => value.includes(word)
  );

}


// ------------------------------------------------------------
// CHECK JOB / NOTICE
// ------------------------------------------------------------

function looksLikeJob(text) {

  const value =
    String(text || "")
      .toLowerCase();

  return JOB_KEYWORDS.some(
    word => value.includes(word)
  );

}


function looksLikeNotice(text) {

  const value =
    String(text || "")
      .toLowerCase();

  return NOTICE_KEYWORDS.some(
    word => value.includes(word)
  );

}


// ------------------------------------------------------------
// CATEGORY
// ------------------------------------------------------------

function getCategory(source, text) {

  const value =
    String(text || "")
      .toLowerCase();

  if (source.type === "private") {

    return "Private Jobs";

  }

  if (
    source.name === "OSSC" ||
    source.name === "OPSC" ||
    source.name === "Odisha Police"
  ) {

    return "Odisha Government Jobs";

  }

  if (
    value.includes("admit card") ||
    value.includes("admission letter") ||
    value.includes("hall ticket")
  ) {

    return "Admit Card";

  }

  return "All India Government Jobs";

}


// ------------------------------------------------------------
// GET NOTICE TYPE
// ------------------------------------------------------------

function getNoticeType(text) {

  const value =
    String(text || "")
      .toLowerCase();

  if (
    value.includes("admit card") ||
    value.includes("admission letter") ||
    value.includes("hall ticket")
  ) {

    return "Admit Card";

  }

  if (
    value.includes("result") ||
    value.includes("merit list") ||
    value.includes("selection list")
  ) {

    return "Result";

  }

  if (
    value.includes("answer key")
  ) {

    return "Answer Key";

  }

  if (
    value.includes("recruitment") ||
    value.includes("vacancy") ||
    value.includes("advertisement") ||
    value.includes("hiring")
  ) {

    return "Job";

  }

  return "Notification";

}


// ------------------------------------------------------------
// EXTRACT DATE FROM TEXT
// ------------------------------------------------------------

function extractDate(text) {

  const value =
    String(text || "");

  const patterns = [

    /\b(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})\b/,

    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2})\b/i,

    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i

  ];

  for (const pattern of patterns) {

    const match =
      value.match(pattern);

    if (match) {

      const date =
        new Date(
          match[0]
        );

      if (!Number.isNaN(date.getTime())) {

        return date.toISOString();

      }

    }

  }

  return new Date().toISOString();

}


// ------------------------------------------------------------
// CREATE TITLE
// ------------------------------------------------------------

function createTitle(
  source,
  title,
  href
) {

  let clean =
    cleanText(title);

  if (!clean) {

    try {

      clean =
        decodeURIComponent(
          href.split("/").pop()
        );

    } catch {

      clean = source.name;

    }

  }

  clean =
    clean
      .replace(
        /\.pdf$/i,
        ""
      )
      .replace(
        /[_-]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (clean.length > 180) {

    clean =
      clean.substring(0, 180) + "...";

  }

  return clean ||
    `${source.name} Recruitment Notification`;

}


// ------------------------------------------------------------
// EXTRACT LINKS
// ------------------------------------------------------------

function extractLinks(
  html,
  source
) {

  const results = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  let scanned = 0;

  while (
    (match = regex.exec(html)) !== null
  ) {

    scanned++;

    const href =
      normalizeUrl(
        match[1],
        source.url
      );

    const title =
      cleanText(match[2]);

    if (!href) {
      continue;
    }

    if (!title && !href) {
      continue;
    }

    const combined =
      `${title} ${href}`;

    // --------------------------------------------------------
    // REMOVE NCS / UNWANTED SERVICE
    // --------------------------------------------------------

    if (
      isBlocked(combined)
    ) {

      continue;

    }

    // --------------------------------------------------------
    // JOB / NOTICE CHECK
    // --------------------------------------------------------

    if (
      !looksLikeJob(combined) &&
      !looksLikeNotice(combined)
    ) {

      continue;

    }

    // --------------------------------------------------------
    // FILE / URL FILTER
    // --------------------------------------------------------

    const lowerUrl =
      href.toLowerCase();

    const usefulFile =
      lowerUrl.includes(".pdf") ||
      lowerUrl.includes("recruit") ||
      lowerUrl.includes("advert") ||
      lowerUrl.includes("notice") ||
      lowerUrl.includes("job") ||
      lowerUrl.includes("vacan") ||
      lowerUrl.includes("admit") ||
      lowerUrl.includes("result") ||
      lowerUrl.includes("apply");

    const usefulTitle =
      looksLikeJob(title) ||
      looksLikeNotice(title);

    if (
      !usefulFile &&
      !usefulTitle
    ) {

      continue;

    }

    const category =
      getCategory(
        source,
        combined
      );

    const noticeType =
      getNoticeType(
        combined
      );

    const publishedAt =
      extractDate(
        combined
      );

    const jobTitle =
      createTitle(
        source,
        title,
        href
      );

    results.push({

      title:
        `${source.name} - ${jobTitle}`,

      description:
        `${noticeType} from ${source.name}. Official notification link.`,

      category,

      source:
        source.name,

      apply_url:
        href,

      published_at:
        publishedAt

    });

  }

  console.log(
    `🔎 ${source.name}: scanned ${scanned} links → ${results.length} possible job/notice links`
  );

  return results;

}


// ------------------------------------------------------------
// REMOVE DUPLICATES
// ------------------------------------------------------------

function removeDuplicates(items) {

  const seen =
    new Set();

  const output = [];

  for (const item of items) {

    const key =
      String(
        item.apply_url || ""
      )
        .trim()
        .toLowerCase();

    if (!key) {
      continue;
    }

    if (
      seen.has(key)
    ) {

      continue;

    }

    seen.add(key);

    output.push(item);

  }

  return output;

}


// ------------------------------------------------------------
// SUPABASE REQUEST
// ------------------------------------------------------------

function supabaseRequest(
  method,
  path,
  body
) {

  return new Promise(
    (resolve, reject) => {

      const url =
        new URL(
          SUPABASE_URL +
          path
        );

      const options = {

        method,

        hostname:
          url.hostname,

        path:
          url.pathname +
          url.search,

        headers: {

          "apikey":
            SUPABASE_SERVICE_ROLE_KEY,

          "Authorization":
            "Bearer " +
            SUPABASE_SERVICE_ROLE_KEY,

          "Content-Type":
            "application/json",

          "Prefer":
            "return=representation"

        },

        timeout: 30000

      };

      const req =
        https.request(
          options,
          res => {

            let data = "";

            res.on(
              "data",
              chunk => {
                data += chunk;
              }
            );

            res.on(
              "end",
              () => {

                if (
                  res.statusCode >= 200 &&
                  res.statusCode < 300
                ) {

                  let parsed = null;

                  try {

                    parsed =
                      data
                        ? JSON.parse(data)
                        : null;

                  } catch {

                    parsed = data;

                  }

                  resolve(parsed);

                } else {

                  reject(
                    new Error(
                      `Supabase HTTP ${res.statusCode}: ${data}`
                    )
                  );

                }

              }
            );

          }
        );

      req.on(
        "timeout",
        () => {

          req.destroy(
            new Error(
              "Supabase request timeout"
            )
          );

        }
      );

      req.on(
        "error",
        reject
      );

      if (body) {

        req.write(
          JSON.stringify(body)
        );

      }

      req.end();

    }
  );

}


// ------------------------------------------------------------
// UPSERT JOB
// ------------------------------------------------------------

async function saveJob(job) {

  const encodedUrl =
    encodeURIComponent(
      job.apply_url
    );

  // First check if this URL already exists.
  const existing =
    await supabaseRequest(
      "GET",
      `/rest/v1/job_updates?select=id,apply_url,published_at&apply_url=eq.${encodedUrl}&limit=1`
    );

  if (
    Array.isArray(existing) &&
    existing.length > 0
  ) {

    const id =
      existing[0].id;

    await supabaseRequest(
      "PATCH",
      `/rest/v1/job_updates?id=eq.${encodeURIComponent(id)}`,
      {

        title:
          job.title,

        description:
          job.description,

        category:
          job.category,

        source:
          job.source,

        apply_url:
          job.apply_url,

        published_at:
          job.published_at

      }
    );

    console.log(
      `🔄 UPDATED: ${job.title}`
    );

    return "updated";

  }


  await supabaseRequest(
    "POST",
    "/rest/v1/job_updates",
    {

      title:
        job.title,

      description:
        job.description,

      category:
        job.category,

      source:
        job.source,

      apply_url:
        job.apply_url,

      published_at:
        job.published_at

    }
  );

  console.log(
    `🆕 ADDED: ${job.title}`
  );

  return "added";

}


// ------------------------------------------------------------
// SAVE ALL
// ------------------------------------------------------------

async function saveJobs(jobs) {

  let added = 0;

  let updated = 0;

  let failed = 0;

  for (const job of jobs) {

    try {

      const result =
        await saveJob(job);

      if (
        result === "added"
      ) {

        added++;

      } else if (
        result === "updated"
      ) {

        updated++;

      }

    } catch (error) {

      failed++;

      console.error(
        `❌ Database error for ${job.title}`
      );

      console.error(
        error.message
      );

    }

  }

  return {
    added,
    updated,
    failed
  };

}


// ------------------------------------------------------------
// MAIN CHECKER
// ------------------------------------------------------------

async function runChecker() {

  console.log("");

  console.log(
    "🚀 JOBMITRA AI - AUTOMATIC JOB CHECKER"
  );

  console.log(
    "========================================"
  );

  console.log(
    "🇮🇳 All India Govt Jobs"
  );

  console.log(
    "🟢 Odisha Govt Jobs"
  );

  console.log(
    "🏢 Private Jobs"
  );

  console.log(
    "🎫 Admit Card / Results / Notices"
  );

  console.log(
    "❌ NCS service pages removed"
  );

  console.log("");

  let allJobs = [];

  for (
    const source of SOURCES
  ) {

    console.log("");

    console.log(
      `🌐 Checking ${source.name}...`
    );

    try {

      const html =
        await fetchPage(
          source.url
        );

      console.log(
        `✅ ${source.name} loaded: ${Buffer.byteLength(
          html,
          "utf8"
        )} bytes`
      );

      const jobs =
        extractLinks(
          html,
          source
        );

      allJobs.push(
        ...jobs
      );

    } catch (error) {

      console.error(
        `❌ ${source.name} error: ${error.message}`
      );

    }

  }


  // ----------------------------------------------------------
  // UNIQUE
  // ----------------------------------------------------------

  allJobs =
    removeDuplicates(
      allJobs
    );


  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    `📋 TOTAL VALID JOB/NOTICE LINKS: ${allJobs.length}`
  );

  console.log(
    "========================================"
  );


  // ----------------------------------------------------------
  // SAVE TO SUPABASE
  // ----------------------------------------------------------

  if (
    allJobs.length === 0
  ) {

    console.log(
      "⚠️ No new valid job links found."
    );

  } else {

    const result =
      await saveJobs(
        allJobs
      );

    console.log("");

    console.log(
      "📊 SUPABASE RESULT"
    );

    console.log(
      "--------------------------"
    );

    console.log(
      `🆕 Added   : ${result.added}`
    );

    console.log(
      `🔄 Updated : ${result.updated}`
    );

    console.log(
      `❌ Failed  : ${result.failed}`
    );

  }


  console.log("");

  console.log(
    "🏁 JobMitra AI checker finished."
  );

  console.log("");

}


// ------------------------------------------------------------
// RUN
// ------------------------------------------------------------

runChecker()
  .catch(error => {

    console.error("");

    console.error(
      "🔥 FATAL CHECKER ERROR:"
    );

    console.error(
      error
    );

    process.exit(1);

  });
