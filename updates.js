/* =====================================================
   JOBMITRA AI — DAILY UPDATES
   Created by Babulu Naik
   ===================================================== */

/*
  HOW TO ADD NEW UPDATE:

  1. Copy any object below
  2. Change the details
  3. Put newest post at the TOP
  4. Save updates.js

  date format: YYYY-MM-DD

  category:
  govt-job
  odisha-job
  private-job
  scholarship
  admit-card
  result
  student
  farmer
  news
  sports
*/

const JOBMITRA_UPDATES = [

/* =====================================================
   🔴 NEW GOVERNMENT JOBS
   ===================================================== */

{
  type: "govt-job",
  title: "Government Job Update",
  titleOr: "ନୂଆ ସରକାରୀ ଚାକିରି",
  department: "Government Recruitment",
  location: "All India",
  qualification: "10th / 12th / Graduate",
  age: "As per official notification",
  salary: "As per post",
  fee: "Check official notification",
  lastDate: "Check official notification",
  examDate: "To be announced",
  documents: [
    "Aadhaar Card",
    "Passport Photo",
    "Signature",
    "Educational Certificate",
    "Caste Certificate if applicable"
  ],
  details:
    "Official recruitment notification, eligibility, vacancy, age limit and application details check before applying.",
  apply:
    "https://www.upsc.gov.in/",
  source:
    "Official Recruitment Website",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🏛️ ODISHA GOVERNMENT JOB
   ===================================================== */

{
  type: "odisha-job",
  title: "Odisha Government Job Update",
  titleOr: "ଓଡ଼ିଶା ସରକାରୀ ଚାକିରି",
  department: "Odisha Government",
  location: "Odisha",
  qualification: "10th / 12th / Graduate",
  age: "As per notification",
  salary: "As per post",
  fee: "Check notification",
  lastDate: "Check official notification",
  examDate: "To be announced",
  documents: [
    "Aadhaar Card",
    "Photo",
    "Signature",
    "10th Certificate",
    "12th / Graduation Certificate",
    "Caste Certificate if applicable",
    "Residence Certificate if required"
  ],
  details:
    "Odisha Government recruitment updates. Always verify vacancy and last date from the official department website.",
  apply:
    "https://odisha.gov.in/",
  source:
    "Odisha Government Official Website",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🏢 PRIVATE JOB
   ===================================================== */

{
  type: "private-job",
  title: "Private Job Update",
  titleOr: "ନୂଆ Private Job",
  department: "Private Company",
  location: "Odisha / India",
  qualification: "10th / 12th / Graduate",
  age: "18+",
  salary: "Company rules",
  fee: "No fee unless official employer says otherwise",
  lastDate: "Check employer",
  examDate: "Interview based",
  documents: [
    "Resume / CV",
    "Aadhaar Card",
    "Passport Photo",
    "Educational Certificate",
    "Bank Details if selected"
  ],
  details:
    "Private sector job opportunity. Never pay money to an unknown person for a job offer.",
  apply:
    "https://www.ncs.gov.in/",
  source:
    "National Career Service",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🎓 SCHOLARSHIP
   ===================================================== */

{
  type: "scholarship",
  title: "Scholarship Update",
  titleOr: "ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ Scholarship",
  department: "Scholarship",
  location: "India",
  qualification: "Eligible Students",
  age: "As per scheme",
  salary: "-",
  fee: "Free",
  lastDate: "Check official portal",
  examDate: "-",
  documents: [
    "Aadhaar Card",
    "Student ID",
    "Marksheet",
    "Income Certificate",
    "Caste Certificate if applicable",
    "Bank Account",
    "Passport Photo",
    "Mobile Number"
  ],
  details:
    "Scholarship application information. Eligibility and last date may differ according to the scheme.",
  apply:
    "https://scholarships.gov.in/",
  source:
    "National Scholarship Portal",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   📝 ADMIT CARD
   ===================================================== */

{
  type: "admit-card",
  title: "Admit Card Update",
  titleOr: "Admit Card Update",
  department: "Examination",
  location: "India",
  qualification: "According to exam",
  age: "-",
  salary: "-",
  fee: "-",
  lastDate: "-",
  examDate: "Check official website",
  documents: [
    "Application Number",
    "Date of Birth",
    "Registered Mobile Number"
  ],
  details:
    "Candidates should download their admit card only from the official examination website.",
  apply:
    "https://www.nta.ac.in/",
  source:
    "Official Examination Website",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   📊 RESULT
   ===================================================== */

{
  type: "result",
  title: "Exam Result Update",
  titleOr: "ନୂଆ Result Update",
  department: "Examination Result",
  location: "India",
  qualification: "Candidates",
  age: "-",
  salary: "-",
  fee: "Free",
  lastDate: "-",
  examDate: "-",
  documents: [
    "Roll Number",
    "Registration Number",
    "Date of Birth"
  ],
  details:
    "Check examination result using the official result portal.",
  apply:
    "https://results.gov.in/",
  source:
    "Government Results Portal",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🌾 FARMER UPDATE
   ===================================================== */

{
  type: "farmer",
  title: "Farmer Government Scheme Update",
  titleOr: "ଚାଷୀଙ୍କ ପାଇଁ Government Scheme",
  department: "Agriculture",
  location: "Odisha / India",
  qualification: "Eligible Farmers",
  age: "Scheme based",
  salary: "-",
  fee: "Usually Free",
  lastDate: "Scheme based",
  examDate: "-",
  documents: [
    "Aadhaar Card",
    "Mobile Number",
    "Bank Passbook",
    "Land Record",
    "Residence Certificate if required"
  ],
  details:
    "Farmers can check agriculture schemes, subsidy and government assistance through official portals.",
  apply:
    "https://agri.odisha.gov.in/",
  source:
    "Odisha Agriculture Department",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   📰 ODISHA NEWS
   ===================================================== */

{
  type: "news",
  title: "Odisha Latest Update",
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
    "Important Odisha news and government updates will be posted here daily.",
  apply:
    "https://odisha.gov.in/",
  source:
    "Odisha Government",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🇮🇳 INDIA NEWS
   ===================================================== */

{
  type: "news",
  title: "India Latest Update",
  titleOr: "ଆଜିର India News",
  department: "India",
  location: "India",
  qualification: "-",
  age: "-",
  salary: "-",
  fee: "-",
  lastDate: "-",
  examDate: "-",
  documents: [],
  details:
    "Important national updates will be posted here.",
  apply:
    "https://www.india.gov.in/",
  source:
    "Government of India",
  date: "2026-08-13",
  active: true
},

/* =====================================================
   🏏 SPORTS
   ===================================================== */

{
  type: "sports",
  title: "Sports Latest Update",
  titleOr: "ଆଜିର Sports Update",
  department: "Sports",
  location: "India",
  qualification: "-",
  age: "-",
  salary: "-",
  fee: "-",
  lastDate: "-",
  examDate: "-",
  documents: [],
  details:
    "Latest sports updates, cricket news, results and important sports events.",
  apply:
    "#",
  source:
    "JobMitra AI",
  date: "2026-08-13",
  active: true
}

];


/* =====================================================
   🔧 JOBMITRA AI FUNCTIONS
   ===================================================== */

/* Only active posts */
function getActiveUpdates(){

  return JOBMITRA_UPDATES.filter(function(item){

    return item.active === true;

  });

}


/* Latest posts first */
function getLatestUpdates(){

  return getActiveUpdates().sort(function(a,b){

    return new Date(b.date) - new Date(a.date);

  });

}


/* Category filter */
function getUpdatesByType(type){

  return getLatestUpdates().filter(function(item){

    return item.type === type;

  });

}


/* Search */
function searchJobMitraUpdates(keyword){

  keyword = keyword.toLowerCase().trim();

  if(!keyword){
    return getLatestUpdates();
  }

  return getLatestUpdates().filter(function(item){

    return (

      item.title.toLowerCase().includes(keyword) ||

      item.titleOr.toLowerCase().includes(keyword) ||

      item.department.toLowerCase().includes(keyword) ||

      item.location.toLowerCase().includes(keyword) ||

      item.qualification.toLowerCase().includes(keyword)

    );

  });

}


/* =====================================================
   🧾 CREATE UPDATE CARD
   ===================================================== */

function createUpdateCard(item){

  let documents = "";

  if(item.documents && item.documents.length){

    documents =
      "<strong>📄 Documents:</strong><br>" +
      item.documents.join(" • ");

  }

  return `

  <article class="updateCard">

    <div class="updateTop">

      <span class="updateBadge">
        ${getTypeName(item.type)}
      </span>

      <span class="updateDate">
        📅 ${item.date}
      </span>

    </div>

    <h3>
      ${item.title}
    </h3>

    <h4>
      ${item.titleOr}
    </h4>

    <p>
      🏢 <b>Department:</b> ${item.department}
    </p>

    <p>
      📍 <b>Location:</b> ${item.location}
    </p>

    <p>
      🎓 <b>Qualification:</b> ${item.qualification}
    </p>

    <p>
      🎂 <b>Age:</b> ${item.age}
    </p>

    <p>
      💰 <b>Salary:</b> ${item.salary}
    </p>

    <p>
      💳 <b>Fee:</b> ${item.fee}
    </p>

    <p>
      ⏰ <b>Last Date:</b> ${item.lastDate}
    </p>

    <p>
      📝 <b>Exam Date:</b> ${item.examDate}
    </p>

    <div class="updateDetails">
      ${item.details}
    </div>

    <div class="documents">
      ${documents}
    </div>

    <div class="updateButtons">

      <a
        href="${item.apply}"
        target="_blank"
        class="applyBtn"
      >
        🔗 DIRECT APPLY
      </a>

      <a
        href="https://ig.me/m/naik_babulu"
        target="_blank"
        class="dmBtn"
      >
        📩 APPLY ₹99
      </a>

    </div>

    <small>
      Source: ${item.source}
    </small>

  </article>

  `;

}


/* =====================================================
   🏷️ CATEGORY NAME
   ===================================================== */

function getTypeName(type){

  const names = {

    "govt-job":
      "🏛️ Government Job",

    "odisha-job":
      "🏛️ Odisha Govt Job",

    "private-job":
      "🏢 Private Job",

    "scholarship":
      "🎓 Scholarship",

    "admit-card":
      "📝 Admit Card",

    "result":
      "📊 Result",

    "student":
      "🎓 Students",

    "farmer":
      "🌾 Farmer",

    "news":
      "📰 News",

    "sports":
      "🏏 Sports"

  };

  return names[type] || "🆕 Update";

}


/* =====================================================
   🚀 RENDER LATEST UPDATE
   ===================================================== */

function renderLatestUpdates(containerId){

  const container =
    document.getElementById(containerId);

  if(!container) return;

  const posts =
    getLatestUpdates();

  if(!posts.length){

    container.innerHTML =
      "<div class='emptyUpdate'>No new updates.</div>";

    return;

  }

  container.innerHTML =
    posts.map(createUpdateCard).join("");

}


/* =====================================================
   🔴 AUTO UPDATE
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    renderLatestUpdates("latestUpdates");

  }
);
