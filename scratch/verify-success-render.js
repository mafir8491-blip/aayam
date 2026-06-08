const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const viewsDir = "/Users/shraddhashah/Downloads/aayam_committee_-main/views";

try {
  const successTemplate = fs.readFileSync(path.join(viewsDir, "events/register-success.ejs"), "utf8");
  
  const html = ejs.render(successTemplate, {
    subEvent: {
      title: "Technovanza 3.0",
      eventId: {
        _id: "evt-1",
        title: "AAYAM National Tech Conference 2026"
      },
      dayNumber: 1,
      startTime: "10:00 AM",
      endTime: "05:00 PM"
    },
    already: false
  }, {
    views: [viewsDir, path.join(viewsDir, "events")]
  });
  
  console.log("✅ events/register-success.ejs rendered successfully! Length:", html.length);
  process.exit(0);
} catch (e) {
  console.error("❌ events/register-success.ejs rendering failed:", e);
  process.exit(1);
}
