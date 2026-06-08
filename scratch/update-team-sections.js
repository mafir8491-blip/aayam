// scratch/update-team-sections.js
require("dotenv").config();
const { supabase } = require("../config/supabase");

async function run() {
  console.log("Syncing team sections...");

  // 1. Rename "Technical Team" to "Technical & Creatives Team" if it exists
  const { data: techSec, error: fetchErr } = await supabase
    .from("team_sections")
    .select("*")
    .eq("title", "Technical Team")
    .maybeSingle();

  if (fetchErr) {
    console.error("Error fetching Technical Team:", fetchErr.message);
  } else if (techSec) {
    const { error: updateErr } = await supabase
      .from("team_sections")
      .update({ title: "Technical & Creatives Team" })
      .eq("id", techSec.id);
    if (updateErr) {
      console.error("Error updating Technical Team name:", updateErr.message);
    } else {
      console.log("✅ Renamed 'Technical Team' to 'Technical & Creatives Team'");
    }
  }

  // 2. Ensure all required sections exist
  const requiredTitles = [
    "Core Committee",
    "Management Team",
    "Media Team",
    "Technical & Creatives Team",
    "Sports & Cultural Team",
    "Communication & Hospitality"
  ];

  const { data: existingSecs, error: listErr } = await supabase
    .from("team_sections")
    .select("title");

  if (listErr) {
    console.error("Error listing sections:", listErr.message);
    process.exit(1);
  }

  const existingTitles = existingSecs.map(s => s.title);
  const toInsert = requiredTitles.filter(t => !existingTitles.includes(t)).map(title => ({ title }));

  if (toInsert.length > 0) {
    const { error: insertErr } = await supabase
      .from("team_sections")
      .insert(toInsert);
    if (insertErr) {
      console.error("Error inserting sections:", insertErr.message);
    } else {
      console.log("✅ Inserted new sections:", toInsert.map(s => s.title).join(", "));
    }
  } else {
    console.log("ℹ️ All required sections already exist in the database.");
  }

  console.log("Finished syncing sections.");
}

run();
