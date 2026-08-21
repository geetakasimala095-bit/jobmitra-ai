const https = require("https");
const crypto = require("crypto");
const webpush = require("web-push");

/* =====================================================
   SUPABASE CONFIG
   ===================================================== */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase secrets are missing.");
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ VAPID secrets are missing.");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:jobmitraai@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


/* =====================================================
   OSSC PAGES
   ===================================================== */

const OSSC_HOME =
  "https://ossc.gov.in/Public/OSSC/Default.aspx";

const OSSC_ADVERTISEMENTS =
  "https://ossc.gov.in/Public/Pages/View_Content.aspx?id=MeNGKau42B9VX4Nn6oZfXA%3D%3D";

/* =====================================================
   FETCH PAGE
   ===================================================== */

function fetchPage(url) {

  return new Promise((resolve, reject) => {

    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; JobMitraAI/1.0)",
          "Accept":
            "text/html,application/xhtml+xml"
        }
      },
      response => {

        let data = "";

        response.on("data", chunk => {
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
                `HTTP ${response.statusCode} for ${url}`
              )
            );

          }

        });

      }
    );

    request.setTimeout(30000, () => {
      request.destroy(
        new Error("Request timed out")
      );
    });

    request.on("error", reject);

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

  return new Promise((resolve, reject) => {

    const url =
      new URL(SUPABASE_URL + path);

    const body =
      data ? JSON.stringify(data) : null;

    const request =
      https.request(
        {
          hostname: url.hostname,

          path:
            url.pathname +
            url.search,

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


/* =====================================================
   CLEAN HTML
   ===================================================== */

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


/* =====================================================
   FINGERPRINT
   ===================================================== */

function makeFingerprint(
  title,
  url
) {

  return crypto
    .createHash("sha256")
    .update(`${title}|${url}`)
    .digest("hex");

}


/* =====================================================
   JOB FILTER
   ===================================================== */

function isJobRelated(
  title,
  href
) {

  const cleanTitle =
    title
      .toLowerCase()
      .trim();

  const blockedTitles = [

    "apply online",
    "view pdf",
    "post notice",
    "advertisements",
    "notifications",
    "recruitment calendar",
    "home",
    "login",
    "contact us",
    "feedback"

  ];

  if (
    blockedTitles.includes(cleanTitle)
  ) {
    return false;
  }


  const text =
    `${title} ${href}`
      .toLowerCase();


  const positive = [

    "advertisement",
    "recruitment",
    "recruit",
    "vacancy",
    "combined",
    "selection",
    "examination",
    "career",
    "appointment",
    "post"

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
    "mock test",
    "syllabus",
    "calendar"

  ];


  const hasPositive =
    positive.some(
      word => text.includes(word)
    );


  const hasNegative =
    negative.some(
      word => text.includes(word)
    );


  return (
    hasPositive &&
    !hasNegative
  );

}


/* =====================================================
   EXTRACT LINKS
   ===================================================== */

function extractLinks(html) {

  const results = [];

  const regex =
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match = regex.exec(html)) !== null
  ) {

    const href = match[1];

    const title =
      cleanText(match[2]);

    if (
      !title ||
      title.length < 8
    ) {
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


/* =====================================================
   REMOVE DUPLICATES
   ===================================================== */

function uniqueJobs(jobs) {

  const seen = new Set();

  return jobs.filter(job => {

    const key =
      `${job.title}|${job.officialUrl}`
        .toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;

  });

}


/* =====================================================
   PUSH NOTIFICATION
   ===================================================== */

async function sendPushNotification(
  title,
  message,
  url
) {

  console.log(
    "📢 Sending push notification..."
  );

  let subscriptions;

  try {

    subscriptions =
      await supabaseRequest(
        "/rest/v1/push_subscriptions" +
        "?select=endpoint,subscription"
      );

  } catch (error) {

    console.error(
      "❌ Could not load subscriptions:",
      error.message
    );

    return;

  }


  if (
    !Array.isArray(subscriptions) ||
    subscriptions.length === 0
  ) {

    console.log(
      "ℹ️ No push subscribers found."
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
        typeof subscription === "string"
      ) {

        subscription =
          JSON.parse(subscription);

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

          body: message,

          icon:
            "https://jobmitraai.github.io/icon-192.png",

          badge:
            "https://jobmitraai.github.io/icon-192.png",

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

        } catch (deleteError) {

          console.error(
            "⚠️ Could not remove subscription:",
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

async function saveJob(job) {

  const fingerprint =
    makeFingerprint(
      job.title,
      job.officialUrl
    );


  const existing =
    await supabaseRequest(

      "/rest/v1/jobs" +
      "?fingerprint=eq." +
      encodeURIComponent(fingerprint) +
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


  await supabaseRequest(

    "/rest/v1/jobs",

    "POST",

    {

      title:
        job.title,

      organization:
        "Odisha Staff Selection Commission",

      category:
        "Jobs",

      official_url:
        job.officialUrl,

      source_url:
        OSSC_ADVERTISEMENTS,

      source_name:
        "OSSC",

      fingerprint,

      is_verified:
        true,

      is_active:
        true

    }

  );


  try {

    await supabaseRequest(

      "/rest/v1/job_updates",

      "POST",

      {

        title:
          job.title,

        description:
          "New recruitment-related update found on the official OSSC website.",

        category:
          "Jobs",

        apply_url:
          job.officialUrl,

        published_at:
          new Date().toISOString()

      }

    );

    console.log(
      "✅ Added to job_updates."
    );

  } catch (error) {

    console.error(
      "⚠️ job_updates save failed:",
      error.message
    );

  }


  try {

    await supabaseRequest(

      "/rest/v1/notifications",

      "POST",

      {

        title:
          `New OSSC Job: ${job.title}`,

        message:
          "New recruitment-related update found on the official OSSC website.",

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
      "⚠️ notifications save failed:",
      error.message
    );

  }


  await sendPushNotification(

    "💼 New OSSC Job",

    job.title,

    job.officialUrl

  );


  console.log(
    `🆕 Added: ${job.title}`
  );


  return true;

}


/* =====================================================
   MAIN
   ===================================================== */

async function main() {

  console.log(
    "🚀 JobMitra AI - Automatic Job Checker"
  );


  try {

    console.log(
      "🌐 Fetching OSSC pages..."
    );


    const homeHtml =
      await fetchPage(
        OSSC_HOME
      );


    console.log(
      `✅ OSSC homepage loaded: ${homeHtml.length} bytes`
    );


    let jobs =
      extractLinks(
        homeHtml
      );


    console.log(
      `🔎 Homepage jobs: ${jobs.length}`
    );


    try {

      const advertisementHtml =
        await fetchPage(
          OSSC_ADVERTISEMENTS
        );


      console.log(
        `✅ Advertisements page loaded: ${advertisementHtml.length} bytes`
      );


      const advertisementJobs =
        extractLinks(
          advertisementHtml
        );


      console.log(
        `🔎 Advertisement jobs: ${advertisementJobs.length}`
      );


      jobs =
        jobs.concat(
          advertisementJobs
        );

    } catch (error) {

      console.error(
        "⚠️ Advertisement page failed:",
        error.message
      );

    }


    jobs =
      uniqueJobs(jobs);


    console.log(
      `🔎 Total possible jobs: ${jobs.length}`
    );


    let added = 0;


    for (
      const job of jobs
    ) {

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

        source_name:
          "OSSC",

        status:
          "success",

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
      "🔔 Push notification system active."
    );

    console.log(
      "✅ Automatic check completed."
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

          source_name:
            "OSSC",

          status:
            "error",

          jobs_found:
            0,

          jobs_added:
            0,

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
