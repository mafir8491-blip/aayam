require("dotenv").config();
const { supabase } = require("./config/supabase");

async function run() {
  try {
    console.log("Fetching a raw record from the registrations table...");
    const { data, error } = await supabase.from("registrations").select("*").limit(1);
    if (error) {
      console.error("❌ Failed to query registrations:", error);
    } else {
      console.log("✅ Success! Raw record:", data);
    }
  } catch (error) {
    console.error("❌ Script error:", error);
  }
  process.exit(0);
}

run();
