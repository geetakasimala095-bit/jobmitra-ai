const latestNotifications = [
  {
    type: "job",
    icon: "👮",
    title: "Odisha Police Recruitment",
    department: "Odisha Police",
    vacancy: "Various Posts",
    lastDate: "30 Aug 2026",
    link: "#"
  },
  {
    type: "scholarship",
    icon: "🎓",
    title: "Odisha Scholarship Update",
    department: "State Scholarship Portal",
    eligibility: "Eligible Students",
    lastDate: "31 Aug 2026",
    link: "#"
  },
  {
    type: "admitcard",
    icon: "🎫",
    title: "Latest Exam Admit Card",
    examDate: "Check Official Notice",
    released: "Released",
    link: "#"
  }
];

function showLatestNotifications() {

  const box = document.getElementById("latestNotifications");

  if (!box) {
    console.log("latestNotifications div found nahi hela");
    return;
  }

  box.innerHTML = `
    <div style="
      font-size:22px;
      font-weight:900;
      color:#8b0000;
      margin-bottom:15px;
    ">
      🔔 Latest Notifications
    </div>
  `;

  latestNotifications.forEach(item => {

    let bg = "#b00000";
    let badge = "JOB NOTIFICATION";
    let button = "Apply Now →";
    let extra = `
      <p>👥 Vacancy: ${item.vacancy}</p>
      <p>⏳ Last Date: <b>${item.lastDate}</b></p>
    `;

    if (item.type === "scholarship") {
      bg = "#00897b";
      badge = "🎓 SCHOLARSHIP";
      extra = `
        <p>🎓 Eligibility: ${item.eligibility}</p>
        <p>⏳ Last Date: <b>${item.lastDate}</b></p>
      `;
    }

    if (item.type === "admitcard") {
      bg = "#673ab7";
      badge = "🎫 ADMIT CARD";
      button = "Download Admit Card →";
      extra = `
        <p>📅 Exam Date: <b>${item.examDate}</b></p>
        <p>✅ Status: ${item.released}</p>
      `;
    }

    box.innerHTML += `
      <div style="
        background:${bg};
        color:white;
        padding:18px;
        margin-bottom:15px;
        border-radius:18px;
        box-shadow:0 6px 18px rgba(0,0,0,.25);
      ">

        <div style="font-size:28px;">
          ${item.icon}
        </div>

        <div style="
          display:inline-block;
          background:white;
          color:${bg};
          padding:5px 10px;
          border-radius:20px;
          font-size:10px;
          font-weight:900;
          margin-top:5px;
        ">
          ${badge}
        </div>

        <h3 style="
          color:white;
          margin:10px 0 8px;
          font-size:18px;
        ">
          ${item.title}
        </h3>

        <p>🏢 ${item.department}</p>

        ${extra}

        <a href="${item.link}" style="
          display:inline-block;
          background:white;
          color:${bg};
          padding:9px 14px;
          border-radius:10px;
          text-decoration:none;
          font-weight:900;
          margin-top:8px;
        ">
          ${button}
        </a>

      </div>
    `;
  });
}

// Page load pare run haba
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    showLatestNotifications
  );
} else {
  showLatestNotifications();
}
