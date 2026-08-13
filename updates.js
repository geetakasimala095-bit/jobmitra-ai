const JOBMITRA_UPDATES = [
  {
    type: "govt-job",
    title: "New Government Job Update",
    titleOr: "ନୂଆ ସରକାରୀ ଚାକିରି",
    department: "Government Recruitment",
    location: "All India",
    qualification: "10th / 12th / Graduate",
    age: "18+",
    salary: "As per post",
    fee: "Check notification",
    lastDate: "Check Official Notification",
    examDate: "To be announced",

    documents: [
      "Aadhaar Card",
      "Passport Photo",
      "Signature",
      "Educational Certificate"
    ],

    details:
      "ଏହା JobMitra AI ର daily government job update. Official notification check କରି apply କରନ୍ତୁ।",

    apply: "https://www.upsc.gov.in/",
    source: "Official Website",
    date: "2026-08-13",
    active: true
  },

  {
    type: "scholarship",
    title: "Scholarship Update",
    titleOr: "ନୂଆ Scholarship Update",
    department: "Scholarship",
    location: "India",
    qualification: "Eligible Students",
    age: "As per scheme",
    salary: "-",
    fee: "Free",
    lastDate: "Check Official Portal",
    examDate: "-",

    documents: [
      "Aadhaar Card",
      "Marksheet",
      "Income Certificate",
      "Bank Passbook",
      "Passport Photo"
    ],

    details:
      "Students scholarship information ଓ required documents ଏଠାରେ ଦେଖାଯିବ।",

    apply: "https://scholarships.gov.in/",
    source: "National Scholarship Portal",
    date: "2026-08-13",
    active: true
  },

  {
    type: "news",
    title: "Odisha Latest News",
    titleOr: "ଆଜିର ଓଡ଼ିଶା ଖବର",
    department: "Odisha",
    location: "Odisha",
    qualification: "-",
    age: "-",
    salary: "-",
    fee: "-",
    lastDate: "-",
    examDate: "-",

    documents: [],

    details:
      "ଆଜିର ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ Odisha news ଓ government updates ଏଠାରେ ପୋଷ୍ଟ କରାଯିବ।",

    apply: "https://odisha.gov.in/",
    source: "Odisha Government",
    date: "2026-08-13",
    active: true
  }
];


function getTypeName(type) {

  const names = {
    "govt-job": "🏛️ Government Job",
    "odisha-job": "🏛️ Odisha Govt Job",
    "private-job": "🏢 Private Job",
    "scholarship": "🎓 Scholarship",
    "admit-card": "📝 Admit Card",
    "result": "📊 Result",
    "student": "🎓 Students",
    "farmer": "🌾 Farmer",
    "news": "📰 News",
    "sports": "🏏 Sports"
  };

  return names[type] || "🆕 Update";
}


function createUpdateCard(item) {

  return `
    <article style="
      background:white;
      padding:18px;
      margin-bottom:15px;
      border-radius:18px;
      border:1px solid #ddd;
      box-shadow:0 5px 15px #0001;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        margin-bottom:10px;
      ">
        <b style="color:#b00000">
          ${getTypeName(item.type)}
        </b>

        <small>📅 ${item.date}</small>
      </div>

      <h2 style="margin-bottom:5px">
        ${item.title}
      </h2>

      <h3 style="color:#8b0000;margin-bottom:12px">
        ${item.titleOr}
      </h3>

      <p>🏢 <b>Department:</b> ${item.department}</p>

      <p>📍 <b>Location:</b> ${item.location}</p>

      <p>🎓 <b>Qualification:</b> ${item.qualification}</p>

      <p>🎂 <b>Age:</b> ${item.age}</p>

      <p>💰 <b>Salary:</b> ${item.salary}</p>

      <p>💳 <b>Fee:</b> ${item.fee}</p>

      <p>⏰ <b>Last Date:</b> ${item.lastDate}</p>

      <p>📝 <b>Exam Date:</b> ${item.examDate}</p>

      <div style="
        background:#fff7df;
        padding:12px;
        margin:12px 0;
        border-radius:10px;
      ">
        ${item.details}
      </div>

      ${
        item.documents.length
          ? `
            <div style="
              background:#f4f4f4;
              padding:12px;
              border-radius:10px;
            ">
              <b>📄 Documents Required</b>
              <br><br>
              ${item.documents.join(" • ")}
            </div>
          `
          : ""
      }

      <div style="
        display:flex;
        gap:8px;
        margin-top:15px;
        flex-wrap:wrap;
      ">

        <a
          href="${item.apply}"
          target="_blank"
          style="
            background:#075e9c;
            color:white;
            padding:11px 15px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          🔗 DIRECT APPLY
        </a>

        <a
          href="https://ig.me/m/naik_babulu"
          target="_blank"
          style="
            background:#c51616;
            color:white;
            padding:11px 15px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          📩 APPLY ₹99
        </a>

      </div>

      <small style="display:block;margin-top:12px;color:#777">
        Source: ${item.source}
      </small>

    </article>
  `;
}


function renderLatestUpdates() {

  const box = document.getElementById("latestUpdates");

  if (!box) {
    console.log("latestUpdates box not found");
    return;
  }

  const activePosts =
    JOBMITRA_UPDATES.filter(item => item.active === true);

  box.innerHTML =
    activePosts.map(createUpdateCard).join("");
}


document.addEventListener("DOMContentLoaded", function() {

  renderLatestUpdates();

});
