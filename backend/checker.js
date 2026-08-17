// JobMitra AI - Automatic Job Checker
// STEP 1: Basic checker setup

console.log("🚀 JobMitra AI Automatic Checker Started");

const sources = [
  {
    name: "OSSC",
    url: "https://www.ossc.gov.in/"
  },
  {
    name: "OPSC",
    url: "https://www.opsc.gov.in/"
  },
  {
    name: "Odisha Police",
    url: "https://odishapolice.gov.in/"
  },
  {
    name: "SSC",
    url: "https://ssc.gov.in/"
  },
  {
    name: "UPSC",
    url: "https://upsc.gov.in/"
  },
  {
    name: "Railway Recruitment",
    url: "https://www.rrbcdg.gov.in/"
  }
];

console.log(`📡 Checking ${sources.length} official sources...`);

for (const source of sources) {
  console.log(`🔎 ${source.name}: ${source.url}`);
}

console.log("✅ Source list loaded successfully.");
console.log("⏳ Automatic database connection will be added next.");
