const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const viewsDir = "/Users/shraddhashah/Downloads/aayam_committee_-main/views";

try {
  const registerTemplate = fs.readFileSync(path.join(viewsDir, "events/register.ejs"), "utf8");
  
  const html = ejs.render(registerTemplate, {
    subEvent: {
      _id: "sub-1",
      title: "Technovanza 3.0",
      description: "Sample tech sub-event",
      eventId: {
        _id: "evt-1",
        title: "AAYAM National Tech Conference 2026"
      },
      dayNumber: 1,
      startTime: "10:00 AM",
      endTime: "05:00 PM",
      formFields: [
        { _id: "f-1", label: "T-shirt Size", type: "dropdown", required: true, options: ["S", "M", "L", "XL"], order: 1, askForMembers: false },
        { _id: "f-2", label: "Github URL", type: "text", required: false, order: 2, askForMembers: true }
      ],
      enableTeamMembers: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      requirePaymentScreenshot: true,
      maxParticipants: 100,
      registrationCount: 12
    },
    user: {
      name: "John Doe",
      email: "john.doe@example.com"
    },
    query: {}
  }, {
    views: [viewsDir, path.join(viewsDir, "events")]
  });
  
  console.log("✅ events/register.ejs rendered successfully! Length:", html.length);
  process.exit(0);
} catch (e) {
  console.error("❌ events/register.ejs rendering failed:", e);
  process.exit(1);
}
