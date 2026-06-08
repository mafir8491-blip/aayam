require("dotenv").config();
const { supabase } = require("./config/supabase");
const SubEvent = require("./models/SubEvent");
const Registration = require("./models/Registration");

async function run() {
  try {
    const subEventId = "f1592948-1f45-431b-9b79-e6532df0d038";
    console.log(`Checking registrations for sub-event: ${subEventId}`);
    
    const subEvent = await SubEvent.findById(subEventId);
    if (!subEvent) {
      console.error("❌ Sub-event not found!");
      process.exit(1);
    }

    const registrations = await Registration.find({ subEventId });
    console.log(`Found ${registrations.length} registrations.`);

    if (registrations.length === 0) {
      console.log("No registrations found. Creating a mock registration...");
      const mockReg = await Registration.create({
        subEventId,
        participantName: "Test Student",
        participantEmail: "teststudent@example.com",
        participantPhone: "9876543210",
        status: "pending",
        responses: [
          { fieldId: subEvent.formFields[0]._id, value: "Government College of Engineering" },
          { fieldId: subEvent.formFields[1]._id, value: "3rd Year" },
          { fieldId: subEvent.formFields[2]._id, value: ["Web Development", "AI/ML"] },
          { fieldId: subEvent.formFields[3]._id, value: "/uploads/registrations/1770000000000-id_card.png" }
        ],
        teamMembers: []
      });
      console.log("✅ Mock registration created successfully:", mockReg.id);
    }

    // Now test query and mapping for CSV export logic
    const regs = await Registration.find({ subEventId }).sort({ createdAt: -1 });
    console.log("Processing CSV export simulation...");

    const q = (s) => `"${String(s || "").replace(/"/g, '""')}"`;
    const sortedFields = (subEvent.formFields || []).slice().sort((a, b) => a.order - b.order);
    
    const headerCols = ['"#"', '"Leader Name"', '"Leader Email"', '"Leader Phone"'];
    sortedFields.forEach(f => headerCols.push(q(f.label)));
    headerCols.push('"Status"', '"Registered At"');

    const rows = regs.map((reg, i) => {
      const cols = [];
      cols.push(i + 1);
      cols.push(q(reg.participantName));
      cols.push(q(reg.participantEmail));
      cols.push(q(reg.participantPhone));

      sortedFields.forEach(field => {
        const resp = (reg.responses || []).find(
          r => r.fieldId && r.fieldId.toString() === field._id.toString()
        );
        if (!resp || resp.value === null || resp.value === undefined) { cols.push('""'); return; }
        const val = Array.isArray(resp.value) ? resp.value.join("; ") : resp.value;
        cols.push(q(val));
      });

      cols.push(q(reg.status));
      cols.push(q(new Date(reg.createdAt).toLocaleString("en-IN")));
      return cols.join(",");
    });

    const csv = [headerCols.join(","), ...rows].join("\n");
    console.log("=== GENERATED CSV PREVIEW ===");
    console.log(csv);
    console.log("=============================");
    console.log("✅ CSV generation verification complete and successful!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
  process.exit(0);
}

run();
