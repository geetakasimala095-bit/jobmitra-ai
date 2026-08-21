const https = require("https");
const crypto = require("crypto");
const webpush = require("web-push");


/* =====================================================
   JOBMITRA AI
   ALL INDIA + ODISHA + PRIVATE JOB CHECKER
   ===================================================== */

console.log("");
console.log("🚀 JobMitra AI - Automatic Job Checker");
console.log("🇮🇳 India + 🟢 Odisha + 🏢 Private Jobs");
console.log("");


/* =====================================================
   ENV
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

  console.error(
    "❌ SUPABASE secrets missing."
  );

  process.exit(1);

}


if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {

  console.error(
    "❌ VAPID secrets missing."
  );

  process.exit(1);

}


/* =====================================================
   WEB PUSH
   ===================================================== */

webpush.setVapidDetails(
  "mailto:jobmitraai@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


/* =====================================================
   SOURCES
   ===================================================== */

const SOURCES = [

  {
    name: "UPSC",
    category: "Government",
    url:
      "https://www.upsc.gov.in/recruitment/recruitment-advertisement"
  },

  {
    name: "SSC",
    category: "Government",
    url:
      "https://ssc.gov.in/home/candidate"
  },

  {
    name: "OSSC",
    category: "Odisha Government",
    url:
      "https://ossc.gov.in/Public/OSSC/Default.aspx"
  },

  {
    name: "OSSSC",
    category: "Odisha Government",
    url:
      "https://osssc.gov.in/"
  },

  {
    name: "NCS",
    category: "Private / Government",
    url:
      "https://www.ncs.gov.in/"
  }

];


/* =====================================================
   FETCH WITH REDIRECT
   ===================================================== */

function fetchPage(url, redirects = 0) {

  return new Promise((resolve, reject) => {

    if (redirects > 5) {

      reject(
        new Error("Too many redirects")
      );

      return;

    }


    let parsed;

    try {

      parsed = new URL(url);

    } catch {

      reject(
        new Error("Invalid URL")
      );

      return;

    }


    const request =
      https.get(

        parsed,

        {

          headers: {

            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) JobMitraAI/2.0",

            "Accept":
              "text/html,application/xhtml+xml"

          },

          timeout: 30000

        },

        response => {

          const status =
            response.statusCode || 0;


          console.log(
            `HTTP ${status}: ${url}`
          );


          /* -----------------------------
             REDIRECT
             ----------------------------- */

          if (
            status >= 300 &&
            status < 400 &&
            response.headers.location
          ) {

            const nextUrl =
              new URL(
                response.headers.location,
                url
              ).href;


            response.resume();


            fetchPage(
              nextUrl,
              redirects + 1
            )
              .then(resolve)
              .catch(reject);


            return;

          }


          let data = "";


          response.setEncoding("utf8");


          response.on(
            "data",
            chunk => {

              data += chunk;

            }
          );


          response.on(
            "end",
            () => {

              if (
                status >= 200 &&
                status < 300
              ) {

                resolve({

                  url,
                  status,
                  html: data

                });

              } else {

                reject(
                  new Error(
                    `HTTP ${status}`
                  )
                );

              }

            }
          );

        }

      );


    request.on(
      "timeout",
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
        data !== null
          ? JSON.stringify(data)
          : null;


      const headers = {

        "apikey":
          SUPABASE_KEY,

        "Authorization":
          `Bearer ${SUPABASE_KEY}`,

        "Content-Type":
          "application/json",

        "Prefer":
          "return=representation"

      };


      if (body) {

        headers["Content-Length"] =
          Buffer.byteLength(body);

      }


      const request =
        https.request(

          {

            hostname:
              url.hostname,

            path:
              url.pathname +
              url.search,

            method,

            headers

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
      /\s+/g,
      " "
    )

    .trim();

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
      href,
      baseUrl
    ).href;

  } catch {

    return null;

  }

}


/* =====================================================
   BAD LINK FILTER
   ===================================================== */

function isBadLink(
  title,
  url
) {

  const text =
    `${title} ${url}`
      .toLowerCase();


  const badWords = [

    "skip to main",
    "skip to content",
    "hindi",
    "home",
    "about us",
    "contact us",
    "login",
    "logout",
    "feedback",
    "sitemap",
    "privacy",
    "terms",
    "accessibility",
    "facebook",
    "twitter",
    "youtube",
    "instagram",
    "search",
    "view pdf",
    "download pdf",
    "post notice",
    "apply online",
    "click here",
    "recruitment calendar",
    "instructions to apply online",
    "forms for certificates",
    "answer key",
    "admit card",
    "admission letter",
    "result",
    "question paper",
    "mock test",
    "objection",
    "rejection",
    "syllabus"

  ];


  return badWords.some(
    word =>
      text.includes(word)
  );

}


/* =====================================================
   REAL JOB FILTER
   ===================================================== */

function isRealJob(
  title,
  url
) {

  const text =
    `${title} ${url}`
      .toLowerCase();


  if (isBadLink(title, url)) {

    return false;

  }


  const positiveWords = [

    "recruitment",
    "recruit",
    "vacancy",
    "vacancies",
    "advertisement",
    "advertisements",
    "notification",
    "appointment",
    "selection",
    "employment",
    "job",
    "jobs",
    "career",
    "engagement",
    "hiring",
    "post",
    "posts",
    "direct recruitment",
    "walk in",
    "walk-in",
    "contractual",
    "deputation"

  ];


  const hasPositive =
    positiveWords.some(
      word =>
        text.includes(word)
    );


  if (!hasPositive) {

    return false;

  }


  if (title.length < 12) {

    return false;

  }


  return true;

}


/* =====================================================
   EXTRACT LINKS
   ===================================================== */

function extractJobs(
  html,
  baseUrl,
  sourceName,
  category
) {

  const results = [];


  const regex =
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;


  let match;


  while (
    (match =
      regex.exec(html)) !== null
  ) {

    const href =
      match[1];


    const title =
      cleanText(match[2]);


    if (!title) {

      continue;

    }


    const url =
      absoluteUrl(
        href,
        baseUrl
      );


    if (!url) {

      continue;

    }


    if (
      !isRealJob(
        title,
        url
      )
    ) {

      continue;

    }


    results.push({

      title,

      officialUrl: url,

      sourceName,

      category

    });

  }


  return results;

}


/* =====================================================
   REMOVE DUPLICATES
   ===================================================== */

function uniqueJobs(
  jobs
) {

  const map =
    new Map();


  for (
    const job of jobs
  ) {

    const key =
      `${job.title}|${job.officialUrl}`
        .toLowerCase();


    if (
      !map.has(key)
    ) {

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
  job
) {

  return crypto

    .createHash("sha256")

    .update(

      `${job.sourceName}|${job.title}|${job.officialUrl}`

    )

    .digest("hex");

}


/* =====================================================
   SEND PUSH
   ===================================================== */

async function sendPush(
  job
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
  let removed = 0;


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

          title:
            `💼 New Job - ${job.sourceName}`,

          body:
            job.title,

          icon:
            "https://jobmitraai.github.io/icon-192.png",

          badge:
            "https://jobmitraai.github.io/icon-192.png",

          data: {

            url:
              job.officialUrl

          }

        })

      );


      sent++;


    } catch (error) {

      const code =
        error.statusCode;


      console.error(
        `❌ Push failed: ${code || error.message}`
      );


      /*
       * 404 / 410 = expired subscription
       */

      if (
        code === 404 ||
        code === 410
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

          removed++;

        } catch {

          /* ignore delete error */

        }

      }

    }

  }


  console.log(
    `📨 Push sent: ${sent}`
  );

  console.log(
    `🗑️ Expired removed: ${removed}`
  );

}


/* =====================================================
   SAVE JOB
   ===================================================== */

async function saveJob(
  job
) {

  const fp =
    fingerprint(job);


  /* -----------------------------------------------
     CHECK DUPLICATE
     ----------------------------------------------- */

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


  /* -----------------------------------------------
     SAVE jobs
     ----------------------------------------------- */

  await supabaseRequest(

    "/rest/v1/jobs",

    "POST",

    {

      title:
        job.title,

      organization:
        job.sourceName,

      category:
        job.category,

      official_url:
        job.officialUrl,

      source_url:
        job.officialUrl,

      source_name:
        job.sourceName,

      fingerprint:
        fp,

      is_verified:
        true,

      is_active:
        true

    }

  );


  /* -----------------------------------------------
     SAVE job_updates
     ----------------------------------------------- */

  try {

    await supabaseRequest(

      "/rest/v1/job_updates",

      "POST",

      {

        title:
          job.title,

        description:
          `New ${job.category} job/recruitment update from ${job.sourceName}.`,

        category:
          job.category,

        apply_url:
          job.officialUrl,

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


  /* -----------------------------------------------
     SAVE notification
     ----------------------------------------------- */

  try {

    await supabaseRequest(

      "/rest/v1/notifications",

      "POST",

      {

        title:
          `New Job: ${job.title}`,

        message:
          `New ${job.category} recruitment update from ${job.sourceName}.`,

        type:
          "Jobs",

        official_url:
          job.officialUrl,

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


  /* -----------------------------------------------
     PUSH
     ----------------------------------------------- */

  await sendPush(job);


  console.log(
    `🆕 ADDED: ${job.title}`
  );


  return true;

}


/* =====================================================
   CHECK SOURCE
   ===================================================== */

async function checkSource(
  source
) {

  console.log("");
  console.log(
    `🌐 Checking ${source.name}...`
  );


  try {

    const result =
      await fetchPage(
        source.url
      );


    console.log(
      `✅ ${source.name} loaded: ${result.html.length} bytes`
    );


    const jobs =
      extractJobs(

        result.html,

        result.url,

        source.name,

        source.category

      );


    console.log(
      `🔎 ${source.name}: ${jobs.length} possible jobs`
    );


    return jobs;

  } catch (error) {

    console.error(
      `❌ ${source.name} failed: ${error.message}`
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
          "ALL SOURCES",

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

  const allJobs = [];


  /* -----------------------------------------------
     CHECK ALL SOURCES
     ----------------------------------------------- */

  for (
    const source of SOURCES
  ) {

    const jobs =
      await checkSource(
        source
      );


    allJobs.push(
      ...jobs
    );

  }


  /* -----------------------------------------------
     UNIQUE
     ----------------------------------------------- */

  const jobs =
    uniqueJobs(
      allJobs
    );


  console.log("");
  console.log(
    `🔎 Total filtered jobs: ${jobs.length}`
  );
  console.log("");


  let added = 0;


  /* -----------------------------------------------
     SAVE
     ----------------------------------------------- */

  for (
    const job of jobs
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
        `❌ Save failed "${job.title}": ${error.message}`
      );

    }

  }


  /* -----------------------------------------------
     LOG
     ----------------------------------------------- */

  await saveAutomationLog(

    "success",

    jobs.length,

    added

  );


  console.log("");
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
    "🔔 Push notification system active."
  );

  console.log(
    "✅ Automatic check completed."
  );

}


main()
  .catch(async error => {

    console.error(
      "❌ Checker failed:",
      error.message
    );


    await saveAutomationLog(

      "error",

      0,

      0,

      error.message

    );


    process.exit(1);

  });
