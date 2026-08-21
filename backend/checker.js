const https = require("https");
const crypto = require("crypto");
const webpush = require("web-push");

/* =====================================================
   CONFIG
   ===================================================== */

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY;

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase secrets missing.");
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ VAPID secrets missing.");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:jobmitraai@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


/* =====================================================
   OFFICIAL SOURCES
   ===================================================== */

const SOURCES = [

  {
    name: "NCS",
    category: "Private / Government",
    url: "https://www.ncs.gov.in/jobs-in-all-india"
  },

  {
    name: "UPSC",
    category: "Government",
    url: "https://www.upsc.gov.in/recruitment/recruitment-advertisement"
  },

  {
    name: "SSC",
    category: "Government",
    url: "https://ssc.gov.in/home/candidate"
  },

  {
    name: "OSSC",
    category: "Odisha Government",
    url: "https://ossc.gov.in/Public/OSSC/Default.aspx"
  },

  {
    name: "OSSSC",
    category: "Odisha Government",
    url: "https://www.osssc.gov.in/Public/OSSSC/Default.aspx"
  },

  {
    name: "Odisha Government",
    category: "Odisha Government",
    url: "https://odisha.gov.in/"
  }

];


/* =====================================================
   HTTP FETCH
   ===================================================== */

function fetchPage(url) {

  return new Promise((resolve, reject) => {

    const request =
      https.get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; JobMitraAI/2.0)",
            "Accept":
              "text/html,application/xhtml+xml"
          }
        },
        response => {

          let data = "";

          response.on(
            "data",
            chunk => {
              data += chunk;
            }
          );

          response.on(
            "end",
            () => {

              console.log(
                `HTTP ${response.statusCode}: ${url}`
              );

              if (
                response.statusCode >= 200 &&
                response.statusCode < 400
              ) {

                resolve(data);

              } else {

                reject(
                  new Error(
                    `HTTP ${response.statusCode}`
                  )
                );

              }

            }
          );

        }
      );

    request.setTimeout(
      30000,
      () => {

        request.destroy(
          new Error("Request timeout")
        );

      }
    );

    request.on(
      "error",
      reject
    );

  });

}


/* =====================================================
   CLEAN TEXT
   ===================================================== */

function cleanText(text) {

  return String(text || "")

    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )

    .replace(
      /<style[\s\S]*?<\/style>/gi,
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
      /&#x27;/gi,
      "'"
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


/* =====================================================
   HTML ENTITIES
   ===================================================== */

function decodeHtml(text) {

  return String(text || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/gi, " ");

}


/* =====================================================
   ABSOLUTE URL
   ===================================================== */

function absoluteUrl(
  href,
  baseUrl
) {

  try {

    return new URL(
      decodeHtml(href),
      baseUrl
    ).href;

  } catch {

    return null;

  }

}


/* =====================================================
   REMOVE DUPLICATES
   ===================================================== */

function uniqueJobs(jobs) {

  const map =
    new Map();

  for (const job of jobs) {

    const key =
      `${job.title}|${job.url}`
        .toLowerCase()
        .trim();

    if (!map.has(key)) {

      map.set(
        key,
        job
      );

    }

  }

  return [
    ...map.values()
  ];

}


/* =====================================================
   FINGERPRINT
   ===================================================== */

function fingerprint(
  title,
  url
) {

  return crypto
    .createHash("sha256")
    .update(
      `${title}|${url}`
    )
    .digest("hex");

}


/* =====================================================
   JOB WORD FILTER
   ===================================================== */

function looksLikeJob(
  title,
  url
) {

  const text =
    `${title} ${url}`
      .toLowerCase();

  const positive = [

    "recruitment",
    "recruit",
    "vacancy",
    "job",
    "jobs",
    "career",
    "advertisement",
    "notification",
    "appointment",
    "selection",
    "engagement",
    "hiring",
    "post",
    "posts",
    "employment",
    "apply",
    "application",
    "apprentice",
    "apprenticeship"

  ];

  const negative = [

    "answer key",
    "answer-key",
    "admit card",
    "result",
    "results",
    "syllabus",
    "question paper",
    "mock test",
    "login",
    "register",
    "contact us",
    "about us",
    "home page",
    "privacy policy",
    "terms"

  ];

  const good =
    positive.some(
      word =>
        text.includes(word)
    );

  const bad =
    negative.some(
      word =>
        text.includes(word)
    );

  return good && !bad;

}


/* =====================================================
   GENERIC LINK EXTRACTION
   ===================================================== */

function extractLinks(
  html,
  source
) {

  const jobs = [];

  const regex =
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match = regex.exec(html)) !== null
  ) {

    const href =
      match[1];

    const rawTitle =
      match[2];

    const title =
      cleanText(rawTitle);

    if (!title) {
      continue;
    }

    if (
      title.length < 6 ||
      title.length > 250
    ) {
      continue;
    }

    const url =
      absoluteUrl(
        href,
        source.url
      );

    if (!url) {
      continue;
    }

    if (
      !looksLikeJob(
        title,
        url
      )
    ) {
      continue;
    }

    jobs.push({

      title,

      url,

      source:
        source.name,

      category:
        source.category

    });

  }

  return uniqueJobs(jobs);

}


/* =====================================================
   NCS SPECIAL EXTRACTION
   ===================================================== */

function extractNCSJobs(
  html,
  source
) {

  const jobs = [];

  /*
   NCS server-rendered pages contain
   job title / company / location /
   description / posted information.
  */

  const blocks =
    html.split(
      /(?=<h[1-6][^>]*>)/gi
    );

  for (const block of blocks) {

    const text =
      cleanText(block);

    if (!text) {
      continue;
    }

    if (
      text.length < 20 ||
      text.length > 3000
    ) {
      continue;
    }

    const jobWords = [

      "vacancy",
      "recruitment",
      "hiring",
      "job",
      "jobs",
      "career",
      "employment",
      "fresher",
      "operator",
      "executive",
      "engineer",
      "manager",
      "assistant",
      "officer",
      "supervisor",
      "technician"

    ];

    const isJob =
      jobWords.some(
        word =>
          text.toLowerCase()
            .includes(word)
      );

    if (!isJob) {
      continue;
    }

    const titleMatch =
      block.match(
        /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i
      );

    let title =
      titleMatch
        ? cleanText(titleMatch[1])
        : "";

    if (!title) {

      title =
        text
          .split("Company:")
          [0]
          .trim();

    }

    if (
      !title ||
      title.length < 5
    ) {
      continue;
    }

    let url =
      source.url;

    const linkMatch =
      block.match(
        /<a\b[^>]*href\s*=\s*["']([^"']+)["']/i
      );

    if (linkMatch) {

      const absolute =
        absoluteUrl(
          linkMatch[1],
          source.url
        );

      if (absolute) {
        url = absolute;
      }

    }

    jobs.push({

      title,

      url,

      source:
        "NCS",

      category:
        "Private / Government"

    });

  }

  return uniqueJobs(jobs);

}


/* =====================================================
   SUPABASE REQUEST
   ===================================================== */

function supabaseRequest(
  path,
  method = "GET",
  data = null
) {

  return new Promise(
    (resolve, reject) => {

      const url =
        new URL(
          SUPABASE_URL + path
        );

      const body =
        data
          ? JSON.stringify(data)
          : null;

      const request =
        https.request(
          {
            hostname:
              url.hostname,

            path:
              url.pathname +
              url.search,

            method,

            headers: {

              "apikey":
                SUPABASE_KEY,

              "Authorization":
                `Bearer ${SUPABASE_KEY}`,

              "Content-Type":
                "application/json",

              "Prefer":
                "return=representation"

            }

          },
          response => {

            let result = "";

            response.on(
              "data",
              chunk => {
                result += chunk;
              }
            );

            response.on(
              "end",
              () => {

                if (
                  response.statusCode >= 200 &&
                  response.statusCode < 300
                ) {

                  try {

                    resolve(
                      JSON.parse(
                        result || "[]"
                      )
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

              }
            );

          }
        );

      request.on(
        "error",
        reject
      );

      if (body) {
        request.write(body);
      }

      request.end();

    }
  );

}


/* =====================================================
   PUSH NOTIFICATION
   ===================================================== */

async function sendPush(
  title,
  message,
  url
) {

  let subscriptions;

  try {

    subscriptions =
      await supabaseRequest(
        "/rest/v1/push_subscriptions" +
        "?select=endpoint,subscription"
      );

  } catch (error) {

    console.error(
      "❌ Subscription load failed:",
      error.message
    );

    return;

  }

  if (
    !Array.isArray(subscriptions) ||
    subscriptions.length === 0
  ) {

    console.log(
      "ℹ️ No push subscribers."
    );

    return;

  }

  let sent = 0;

  for (
    const row of subscriptions
  ) {

    try {

      let subscription =
        row.subscription;

      if (
        typeof subscription ===
        "string"
      ) {

        subscription =
          JSON.parse(
            subscription
          );

      }

      if (
        !subscription ||
        !subscription.endpoint
      ) {
        continue;
      }

      await webpush.sendNotification(

        subscription,

        JSON.stringify({

          title,

          body:
            message,

          icon:
            "https://geetakasimala095-bit.github.io/jobmitra-ai/icon-192.png",

          badge:
            "https://geetakasimala095-bit.github.io/jobmitra-ai/icon-192.png",

          data: {
            url
          }

        })

      );

      sent++;

    } catch (error) {

      console.error(
        "❌ Push failed:",
        error.statusCode ||
        error.message
      );

      if (
        error.statusCode === 404 ||
        error.statusCode === 410
      ) {

        try {

          await supabaseRequest(

            "/rest/v1/push_subscriptions" +
            "?endpoint=eq." +
            encodeURIComponent(
              row.endpoint
            ),

            "DELETE"

          );

          console.log(
            "🗑️ Expired subscription removed."
          );

        } catch (deleteError) {

          console.error(
            "❌ Delete failed:",
            deleteError.message
          );

        }

      }

    }

  }

  console.log(
    `📨 Push sent: ${sent}`
  );

}


/* =====================================================
   SAVE JOB
   ===================================================== */

async function saveJob(
  job
) {

  const fp =
    fingerprint(
      job.title,
      job.url
    );

  /*
   * Check duplicate.
   */

  const existing =
    await supabaseRequest(

      "/rest/v1/jobs" +
      "?fingerprint=eq." +
      encodeURIComponent(fp) +
      "&select=id"

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


  /*
   * Save jobs table.
   */

  await supabaseRequest(

    "/rest/v1/jobs",

    "POST",

    {

      title:
        job.title,

      organization:
        job.source,

      category:
        job.category,

      official_url:
        job.url,

      source_url:
        job.url,

      source_name:
        job.source,

      fingerprint:
        fp,

      is_verified:
        true,

      is_active:
        true

    }

  );


  /*
   * Save job_updates.
   */

  try {

    await supabaseRequest(

      "/rest/v1/job_updates",

      "POST",

      {

        title:
          job.title,

        description:
          `New job/recruitment update from ${job.source}.`,

        category:
          job.category,

        apply_url:
          job.url,

        published_at:
          new Date().toISOString()

      }

    );

  } catch (error) {

    console.error(
      "⚠️ job_updates failed:",
      error.message
    );

  }


  /*
   * Save notifications.
   */

  try {

    await supabaseRequest(

      "/rest/v1/notifications",

      "POST",

      {

        title:
          `🆕 ${job.title}`,

        message:
          `New job update from ${job.source}.`,

        type:
          job.category,

        official_url:
          job.url,

        is_active:
          true

      }

    );

  } catch (error) {

    console.error(
      "⚠️ notifications failed:",
      error.message
    );

  }


  /*
   * Push only for NEW job.
   */

  await sendPush(

    `💼 New Job - ${job.source}`,

    job.title,

    job.url

  );


  console.log(
    `🆕 ADDED: ${job.title}`
  );

  return true;

}


/* =====================================================
   CHECK ONE SOURCE
   ===================================================== */

async function checkSource(
  source
) {

  console.log(
    `\n🌐 Checking ${source.name}...`
  );

  try {

    const html =
      await fetchPage(
        source.url
      );

    console.log(
      `✅ ${source.name} loaded: ${html.length} bytes`
    );

    let jobs = [];

    if (
      source.name === "NCS"
    ) {

      jobs =
        extractNCSJobs(
          html,
          source
        );

    } else {

      jobs =
        extractLinks(
          html,
          source
        );

    }

    console.log(
      `🔎 ${source.name}: ${jobs.length} possible jobs`
    );

    return jobs;

  } catch (error) {

    console.error(
      `❌ ${source.name} failed:`,
      error.message
    );

    return [];

  }

}


/* =====================================================
   AUTOMATION LOG
   ===================================================== */

async function saveAutomationLog(
  status,
  found,
  added,
  errorMessage = null
) {

  try {

    await supabaseRequest(

      "/rest/v1/automation_logs",

      "POST",

      {

        source_name:
          "ALL INDIA JOBS",

        status,

        jobs_found:
          found,

        jobs_added:
          added,

        error_message:
          errorMessage

      }

    );

  } catch (error) {

    console.error(
      "⚠️ Automation log failed:",
      error.message
    );

  }

}


/* =====================================================
   MAIN
   ===================================================== */

async function main() {

  console.log(
    "🚀 JobMitra AI - All India Automatic Job Checker"
  );

  console.log(
    "🇮🇳 Government + Private + Odisha Jobs"
  );

  let allJobs = [];

  for (
    const source of SOURCES
  ) {

    const jobs =
      await checkSource(
        source
      );

    allJobs =
      allJobs.concat(
        jobs
      );

  }


  /*
   * Remove duplicate jobs.
   */

  allJobs =
    uniqueJobs(
      allJobs
    );


  console.log(
    "\n================================="
  );

  console.log(
    `📋 Total possible jobs: ${allJobs.length}`
  );


  let added = 0;


  /*
   * Save jobs one by one.
   */

  for (
    const job of allJobs
  ) {

    try {

      const result =
        await saveJob(
          job
        );

      if (result) {
        added++;
      }

    } catch (error) {

      console.error(
        `❌ Save failed: ${job.title}`,
        error.message
      );

    }

  }


  console.log(
    "================================="
  );

  console.log(
    `📋 Found: ${allJobs.length}`
  );

  console.log(
    `🆕 Added: ${added}`
  );

  console.log(
    "🔔 Push notification system active."
  );


  await saveAutomationLog(
    "success",
    allJobs.length,
    added
  );


  console.log(
    "✅ Automatic check completed."
  );

}


main()
  .catch(
    async error => {

      console.error(
        "❌ Fatal checker error:",
        error.message
      );

      await saveAutomationLog(
        "error",
        0,
        0,
        error.message
      );

      process.exit(1);

    }
  );
