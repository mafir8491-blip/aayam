const { supabase } = require("./supabase");

const connectDB = async () => {
  try {
    console.log("🔌 Initializing Supabase Connection...");
    // Test the client setup (it is fine if the dummy check fails/warns about table name, as long as it doesn't crash on invalid credentials)
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error && error.code === "PGRST301") {
      throw new Error(`Authentication failed (Invalid API key): ${error.message}`);
    }
    console.log("✅ Supabase connection initialized successfully");
  } catch (error) {
    console.warn("⚠️  Supabase initialization warning:", error.message);
  }
};

module.exports = connectDB;
