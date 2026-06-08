const ReachOut = require("../models/ReachOut");

/* ===============================
   SHOW FORM (PUBLIC)
================================ */
exports.getReachOutForm = (req, res) => {
  res.json({
    success: req.query.success === "true" || req.query.success === true,
  });
};

/* ===============================
   SUBMIT FORM (PUBLIC)
================================ */
exports.submitReachOutForm = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // TEMP DEBUG

    const { name, email, contact, purpose, subject, heardFrom, message } = req.body;

    if (!name || !email || !purpose || !message) {
      return res.status(400).json({ error: "Missing required fields (name, email, purpose, or message)", redirect: "/reachout" });
    }

    const newReachOut = await ReachOut.create({
      name,
      email,
      contact,
      purpose,
      subject, 
      heardFrom,
      message,
    });

    res.status(201).json({ success: true, reachout: newReachOut, redirect: "/reachout?success=true" });
  } catch (error) {
    console.error("ReachOut Submit Error:", error);
    res.status(500).json({ error: error.message, redirect: "/reachout" });
  }
};


/* ===============================
   ADMIN: VIEW ALL
================================ */
exports.getAllReachOuts = async (req, res) => {
  try {
    const reachouts = await ReachOut.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ reachouts });
  } catch (error) {
    console.error("Admin ReachOut Error:", error);
    res.status(500).json({ error: error.message, redirect: "/" });
  }
};

/* ===============================
   TOGGLE READ / UNREAD
================================ */
exports.toggleReadStatus = async (req, res) => {
  try {
    const item = await ReachOut.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found", redirect: req.headers.referer || "/admin/reachout" });

    item.isRead = !item.isRead;
    await item.save();

    res.json({ success: true, reachout: item, redirect: req.headers.referer || "/admin/reachout" });
  } catch (error) {
    console.error("Toggle Read Error:", error);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/admin/reachout" });
  }
};

/* ===============================
   DELETE (SPAM)
================================ */
exports.deleteReachOut = async (req, res) => {
  try {
    await ReachOut.findByIdAndDelete(req.params.id);
    res.json({ success: true, redirect: req.headers.referer || "/admin/reachout" });
  } catch (error) {
    console.error("Delete ReachOut Error:", error);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/admin/reachout" });
  }
};
