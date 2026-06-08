const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const viewsDir = "/Users/shraddhashah/Downloads/aayam_committee_-main/views";

try {
  const reachoutTemplate = fs.readFileSync(path.join(viewsDir, "reachout/index.ejs"), "utf8");
  
  const html = ejs.render(reachoutTemplate, {
    success: false,
    user: { email: "admin@aayam.org", role: "superadmin" }
  }, {
    views: [viewsDir, path.join(viewsDir, "reachout")]
  });
  
  console.log("✅ reachout/index.ejs rendered successfully! Length:", html.length);
  process.exit(0);
} catch (e) {
  console.error("❌ reachout/index.ejs rendering failed:", e);
  process.exit(1);
}
