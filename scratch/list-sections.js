// scratch/list-sections.js
require("dotenv").config();
const { supabase } = require("../config/supabase");

async function run() {
  const { data: sections, error } = await supabase.from("team_sections").select("*");
  if (error) {
    console.error("Error fetching sections:", error.message);
  } else {
    console.log("Current sections in database:");
    console.log(JSON.stringify(sections, null, 2));
  }
}

run();
