const TeamSection = require("../models/TeamSection");
const TeamMember = require("../models/TeamMember");

/* ===============================
   VIEW TEAM PAGE
================================ */
const getTeamPage = async (req, res) => {
  try {
    const sections = await TeamSection.find().lean();

    for (let section of sections) {
      section.members = await TeamMember.find({
        section: section._id,
      });
    }

    res.json({ sections });
  } catch (err) {
    console.error("Get Team Page Error:", err.message);
    res.status(500).json({ error: err.message, redirect: "/" });
  }
};

/* ===============================
   ADD TEAM SECTION (ADMIN)
================================ */
const addTeamSection = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required", redirect: req.headers.referer || "/team" });
    }

    const newSection = await TeamSection.create({ title: title.trim() });

    res.status(201).json({ success: true, section: newSection, redirect: req.headers.referer || "/team" });
  } catch (err) {
    console.error("Add Team Section Error:", err.message);
    res.status(500).json({ error: err.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   EDIT TEAM SECTION (VIEW)
================================ */
const getEditSection = async (req, res) => {
  try {
    const section = await TeamSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found", redirect: req.headers.referer || "/team" });

    res.json({ section });
  } catch (err) {
    console.error("Edit Section View Error:", err.message);
    res.status(500).json({ error: err.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   UPDATE TEAM SECTION
================================ */
const updateSection = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required", redirect: req.headers.referer || "/team" });
    }

    const updatedSection = await TeamSection.findByIdAndUpdate(req.params.id, {
      title: title.trim(),
    }, { new: true });

    res.json({ success: true, section: updatedSection, redirect: req.headers.referer || "/team" });
  } catch (err) {
    console.error("Update Section Error:", err.message);
    res.status(500).json({ error: err.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   ADD TEAM MEMBER (ADMIN)
================================ */
const addTeamMember = async (req, res) => {
  try {
    const { name, position, sectionId } = req.body;

    if (!name || !sectionId || !req.file) {
      console.log("Missing fields:", req.body);
      return res.status(400).json({ error: "Missing fields (name, sectionId, or image file)", redirect: req.headers.referer || "/team" });
    }

    const imagePath = req.file.path;

    const newMember = await TeamMember.create({
      name: name.trim(),
      position: position ? position.trim() : "",
      image: imagePath,
      section: sectionId,
    });

    res.status(201).json({ success: true, member: newMember, redirect: req.headers.referer || "/team" });
  } catch (error) {
    console.error("Add Team Member Error:", error.message);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   GET EDIT MEMBER PAGE
================================ */
const getEditMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found", redirect: req.headers.referer || "/team" });

    res.json({ member });
  } catch (error) {
    console.error("Get Edit Member Error:", error.message);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   UPDATE TEAM MEMBER
================================ */
const updateMember = async (req, res) => {
  try {
    const { name, position } = req.body;
    const member = await TeamMember.findById(req.params.id);

    if (!member) return res.status(404).json({ error: "Member not found", redirect: req.headers.referer || "/team" });

    member.name = name.trim();
    member.position = position ? position.trim() : "";

    // Update image ONLY if new one uploaded
    if (req.file) {
      member.image = req.file.path;
    }

    await member.save();
    res.json({ success: true, member, redirect: req.headers.referer || "/team" });
  } catch (err) {
    console.error("Update Member Error:", err.message);
    res.status(500).json({ error: err.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   DELETE TEAM MEMBER (ADMIN)
================================ */
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    await TeamMember.findByIdAndDelete(id);

    res.json({ success: true, redirect: req.headers.referer || "/team" });
  } catch (error) {
    console.error("Delete Team Member Error:", error.message);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/team" });
  }
};

/* ===============================
   DELETE TEAM SECTION (ADMIN)
================================ */
const deleteTeamSection = async (req, res) => {
  try {
    const { id } = req.params;

    await TeamMember.deleteMany({ section: id });
    await TeamSection.findByIdAndDelete(id);

    res.json({ success: true, redirect: req.headers.referer || "/team" });
  } catch (error) {
    console.error("Delete Team Section Error:", error.message);
    res.status(500).json({ error: error.message, redirect: req.headers.referer || "/team" });
  }
};

module.exports = {
  getTeamPage,
  addTeamSection,
  addTeamMember,
  getEditSection,
  updateSection,
  getEditMember,
  updateMember,
  deleteTeamMember,
  deleteTeamSection,
};