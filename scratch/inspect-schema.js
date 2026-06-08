require("dotenv").config();
const { pool } = require("../config/supabase");

async function run() {
  if (!pool) {
    console.log("No pg Pool available. Running in offline/mock mode.");
    process.exit(0);
  }
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations';
    `);
    console.log("Columns in registrations table:");
    console.log(res.rows);
  } catch (err) {
    console.error("Error inspecting schema:", err);
  }
  process.exit(0);
}

run();
