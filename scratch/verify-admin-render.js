const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const viewsDir = "/Users/shraddhashah/Downloads/aayam_committee_-main/views";
const tabs = ["dashboard", "events", "teams", "gallery", "messages", "users", "settings"];

try {
  const adminTemplate = fs.readFileSync(path.join(viewsDir, "admin/index.ejs"), "utf8");
  
  for (const tab of tabs) {
    const html = ejs.render(adminTemplate, {
      tab,
      admins: [],
      regularUsers: [],
      stats: {
        eventsCount: 5,
        teamCount: 15,
        reachOutCount: 3,
        userCount: 2
      },
      recentEvents: [],
      recentMessages: [],
      events: [],
      allSubs: [],
      sections: [],
      galleryItems: [],
      promos: [],
      messages: [],
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [0, 0, 0, 0, 0, 0]
      },
      user: { email: "admin@aayam.org", role: "superadmin" }
    }, {
      views: [viewsDir, path.join(viewsDir, "admin")]
    });
    console.log(`✅ Tab '${tab}' rendered successfully! Length:`, html.length);
  }
  
  console.log("🎉 All admin sub-panels compiled and rendered successfully!");
  process.exit(0);
} catch (e) {
  console.error("❌ Rendering failed:", e);
  process.exit(1);
}
