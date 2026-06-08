require("dotenv").config();
const { fork } = require("child_process");
const path = require("path");

async function start() {
  console.log("=========================================");
  console.log("🚀 Starting AAYAM Committee Local Server...");
  console.log("🔌 Backend: Supabase (PostgreSQL)");
  console.log("=========================================");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Missing Supabase Environment Variables!");
    console.error("Please create a '.env' file in the root of the project with:");
    console.error("SUPABASE_URL=your_supabase_project_url");
    console.error("SUPABASE_ANON_KEY=your_supabase_anon_key");
    console.error("DATABASE_URL=your_direct_postgres_connection_string (optional, for session store)");
    console.error("\nFor details, check implementation_plan.md.");
    process.exit(1);
  }

  // Set environment defaults
  process.env.PORT = process.env.PORT || 3000;
  process.env.NODE_ENV = "development";
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "dummy-google-client-id.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "dummy-google-client-secret";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "aayam_committee_session_secret_12345";

  // Start Express Application in a child process (using nodemon for hot-reloading if possible)
  const appPath = path.join(__dirname, "app.js");
  let runnerPath = appPath;
  let runnerArgs = [];

  try {
    runnerPath = require.resolve("nodemon/bin/nodemon.js");
    runnerArgs = [appPath];
    console.log("🔄 Hot-reloading enabled via nodemon");
  } catch (e) {
    console.log("⚠️  Nodemon not found in node_modules, starting with standard node");
  }

  console.log(`🚀 Starting Express App on port ${process.env.PORT}...`);
  const child = fork(runnerPath, runnerArgs, { env: process.env });

  child.on("exit", (code) => {
    console.log(`Express App exited with code ${code}`);
    process.exit(code || 0);
  });

  // Handle termination signals
  process.on("SIGINT", () => {
    child.kill("SIGINT");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
    process.exit(0);
  });
}

start();
