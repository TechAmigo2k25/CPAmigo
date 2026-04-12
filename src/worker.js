require("dotenv").config();
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const { runCode } = require("./executor");

// This line forces the code to look at the correct variable
const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;

console.log("🔍 ATTEMPTING TO CONNECT TO:", redisUrl);

if (!redisUrl) {
  throw new Error("❌ CRITICAL: REDIS_URL is not defined in Railway Variables!");
}

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 4, // Fixes Railway IPv6 bug
});


const worker = new Worker(
  "submissionQueue",
  async (job) => {
    console.log("📥 Job RECEIVED");
    console.log("🆔 Job ID:", job.id);
    console.log("📦 Job Data:", job.data);

    const { code, language, testCases } = job.data;

    console.log("🚀 Starting execution...");
    console.log("🧠 Language:", language);
    console.log("🧪 TestCases Count:", testCases?.length);

    const startTime = Date.now();

    try {
      const results = await runCode(code, language, testCases);

      const endTime = Date.now();

      console.log("✅ Execution Completed");
      console.log("⏱ Execution Time:", endTime - startTime, "ms");
      console.log("📊 Result:", results);

      return results;

    } catch (error) {
      console.error("❌ Execution Failed");
      console.error("🔥 Error:", error);

      throw error;
    }
  },
  { connection }
);

console.log("👷 Worker initialized and waiting for jobs...");


// 🔥 ADD THESE EVENT LISTENERS (VERY IMPORTANT)

worker.on("completed", (job, result) => {
  console.log("🎉 Job COMPLETED:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("💥 Job FAILED:", job?.id);
  console.error("Error:", err.message);
});

worker.on("active", (job) => {
  console.log("⚙️ Job ACTIVE:", job.id);
});

worker.on("waiting", (jobId) => {
  console.log("⏳ Job WAITING:", jobId);
});

worker.on("stalled", (jobId) => {
  console.warn("⚠️ Job STALLED:", jobId);
});

worker.on("error", (err) => {
  console.error("🚨 Worker ERROR:", err);
});

console.log("Judge server running...");