// ==========================================
// 🔔 LATEST NOTIFICATION
// JOB + SCHOLARSHIP + ADMIT CARD
// ==========================================

const latestNotifications = [

  {
    type: "job",
    icon: "👮",
    title: "Odisha Police Recruitment",
    department: "Odisha Police",
    vacancy: "Constable / Other Posts",
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
    title: "Latest Government Exam Admit Card",
    examDate: "Check Official Notice",
    released: "Released",
    link: "#"
  }

];


// ==========================================
// 🎨 BEAUTIFUL DESIGN
// ==========================================

const notificationStyle = document.createElement("style");

notificationStyle.innerHTML = `

#latestNotifications{
  width:100%;
  display:flex;
  flex-direction:column;
  gap:15px;
  margin-top:15px;
}

/* CARD */

.notification-card{
  position:relative;
  width:100%;
  padding:18px;
  border-radius:18px;
  display:flex;
  gap:15px;
  overflow:hidden;
  color:#fff;
  box-shadow:0 8px 25px rgba(0,0,0,.25);
  border:1px solid rgba(255,255,255,.18);
  transition:.3s;
}

.notification-card:hover{
  transform:translateY(-3px);
}


/* JOB */

.job-card{
  background:linear-gradient(135deg,#7f0000,#d40000,#ff3b30);
}


/* SCHOLARSHIP */

.scholarship-card{
  background:linear-gradient(135deg,#004d40,#00897b,#00bfa5);
}


/* ADMIT CARD */

.admit-card{
  background:linear-gradient(135deg,#4527a0,#673ab7,#9c27b0);
}


/* ICON */

.notification-icon{
  min-width:55px;
  height:55px;
  border-radius:50%;
  background:rgba(255,255,255,.18);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
  box-shadow:0 4px 15px rgba(0,0,0,.2);
}


/* CONTENT */

.notification-content{
  flex:1;
}

.notification-content h3{
  margin:7px 0;
  font-size:18px;
  font-weight:800;
  color:#fff;
}

.notification-content p{
  margin:5px 0;
  font-size:13px;
  color:#fff;
}


/* BADGE */

.notification-badge{
  display:inline-block;
  padding:5px 10px;
  border-radius:20px;
  font-size:10px;
  font-weight:900;
  letter-spacing:.5px;
  background:#fff;
  color:#b00000;
}

.scholarship-badge{
  color:#00695c;
}

.admit-badge{
  color:#512da8;
}


/* LAST DATE */

.last-date{
  margin-top:10px !important;
  padding:8px 10px;
  border-radius:10px;
  background:rgba(0,0,0,.22);
  font-size:13px !important;
}

.last-date b{
  color:#ffe600;
}


/* BUTTON */

.apply-btn{
  display:inline-block;
  margin-top:10px;
  padding:9px 15px;
  border-radius:10px;
  background:#fff;
  color:#b00000;
  text-decoration:none;
  font-size:13px;
  font-weight:900;
  box-shadow:0 4px 12px rgba(0,0,0,.2);
  transition:.2s;
}

.apply-btn:hover{
  transform:scale(1.04);
}

.admit-btn{
  color:#512da8;
}


/* TITLE */

.latest-title{
  margin-bottom:10px;
  padding:5px 2px;
  font-size:22px;
  font-weight:900;
  color:#8b0000;
}


/* MOBILE */

@media(max-width:600px){

  .notification-card{
    padding:14px;
    border-radius:15px;
  }

  .notification-icon{
    min-width:45px;
    width:45px;
    height:45px;
    font-size:23px;
  }

  .notification-content h3{
    font-size:16px;
  }

  .notification-content p{
    font-size:12px;
  }

}

`;

document.head.appendChild(notificationStyle);


// ==========================================
// 🔥 DISPLAY NOTIFICATIONS
// ==========================================

function showLatestNotifications(){

  const box = document.getElementById("latestNotifications");

  if(!box) return;

  box.innerHTML = `

    <div class="latest-title">
      🔔 Latest Notifications
    </div>

  `;

  latestNotifications.forEach(item => {

    let card = "";

    // JOB
    if(item.type === "job"){

      card = `
        <div class="notification-card job-card">

          <div class="notification-icon">
            ${item.icon}
          </div>

          <div class="notification-content">

            <span class="notification-badge job-badge">
              JOB NOTIFICATION
            </span>

            <h3>${item.title}</h3>

            <p>🏢 ${item.department}</p>

            <p>👥 Vacancy: ${item.vacancy}</p>

            <p class="last-date">
              ⏳ Last Date:
              <b>${item.lastDate}</b>
            </p>

            <a href="${item.link}" class="apply-btn">
              Apply Now →
            </a>

          </div>

        </div>
      `;
    }


    // SCHOLARSHIP
    if(item.type === "scholarship"){

      card = `
        <div class="notification-card scholarship-card">

          <div class="notification-icon">
            ${item.icon}
          </div>

          <div class="notification-content">

            <span class="notification-badge scholarship-badge">
              SCHOLARSHIP
            </span>

            <h3>${item.title}</h3>

            <p>🏢 ${item.department}</p>

            <p>🎓 Eligibility: ${item.eligibility}</p>

            <p class="last-date">
              ⏳ Last Date:
              <b>${item.lastDate}</b>
            </p>

            <a href="${item.link}" class="apply-btn">
              Apply Now →
            </a>

          </div>

        </div>
      `;
    }


    // ADMIT CARD
    if(item.type === "admitcard"){

      card = `
        <div class="notification-card admit-card">

          <div class="notification-icon">
            ${item.icon}
          </div>

          <div class="notification-content">

            <span class="notification-badge admit-badge">
              ADMIT CARD
            </span>

            <h3>${item.title}</h3>

            <p>📅 Exam Date:
              <b>${item.examDate}</b>
            </p>

            <p>✅ Status: ${item.released}</p>

            <a href="${item.link}" class="apply-btn admit-btn">
              Download Admit Card →
            </a>

          </div>

        </div>
      `;
    }

    box.innerHTML += card;

  });

}


// ==========================================
// 🚀 START
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  showLatestNotifications
);
