const User = require("../models/User");
const Event = require("../models/Event");
const TeamMember = require("../models/TeamMember");
const ReachOut = require("../models/ReachOut");
const Registration = require("../models/Registration");
const bcrypt = require("bcryptjs");

/* =================================
   ADMIN DASHBOARD
================================= */
exports.getAdminDashboard = async (req, res) => {
  try {
    const tab = req.query.tab || 'dashboard';

    const admins = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).lean();

    // Fetch stats counts
    const eventsCount = await Event.countDocuments();
    const teamCount = await TeamMember.countDocuments();
    const reachOutCount = await ReachOut.countDocuments();
    const userCount = await User.countDocuments();

    // Data containers for specific tabs
    let events = [];
    let sections = [];
    let galleryItems = [];
    let promos = [];
    let messages = [];
    let regularUsers = [];
    let allSubs = [];

    // Chart registrations month data (needed if dashboard/overview tab)
    let chartLabels = [];
    let chartData = [];
    let recentEvents = [];
    let recentMessages = [];

    if (tab === 'dashboard') {
      recentEvents = await Event.find().sort({ startDate: -1 }).limit(5).lean();
      recentMessages = await ReachOut.find().sort({ createdAt: -1 }).limit(5).lean();
      
      const registrations = await Registration.find().lean();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyCounts = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        chartLabels.push(label);
        chartData.push(0);
        monthlyCounts[key] = chartLabels.length - 1;
      }
      registrations.forEach(reg => {
        const rawDate = reg.createdAt || reg.created_at;
        if (rawDate) {
          const date = new Date(rawDate);
          if (!isNaN(date.getTime())) {
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyCounts[key] !== undefined) {
              chartData[monthlyCounts[key]]++;
            }
          }
        }
      });
    } else if (tab === 'events') {
      events = await Event.find().sort({ startDate: -1 }).lean();
      const SubEvent = require("../models/SubEvent");
      allSubs = await SubEvent.find({}).lean();
    } else if (tab === 'teams') {
      const TeamSection = require("../models/TeamSection");
      const TeamMember = require("../models/TeamMember");
      sections = await TeamSection.find().lean();
      for (let s of sections) {
        s.members = await TeamMember.find({ section: s._id });
      }
    } else if (tab === 'gallery') {
      const HomeGallery = require("../models/HomeGallery");
      const HomePromo = require("../models/HomePromo");
      galleryItems = await HomeGallery.find().lean();
      promos = await HomePromo.find().sort({ createdAt: -1 }).lean();
    } else if (tab === 'messages') {
      messages = await ReachOut.find().sort({ createdAt: -1 }).lean();
    } else if (tab === 'users') {
      regularUsers = await User.find({ role: "user" }).lean();
    }

    res.json({
      tab,
      admins,
      regularUsers,
      stats: {
        eventsCount,
        teamCount,
        reachOutCount,
        userCount
      },
      recentEvents,
      recentMessages,
      events,
      allSubs,
      sections,
      galleryItems,
      promos,
      messages,
      chartData: {
        labels: chartLabels,
        data: chartData
      }
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ error: error.message, redirect: "/" });
  }
};

/* =================================
   INVITE ADMIN (MAX 10 ADMINS)
================================= */
exports.inviteAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required", redirect: "/admin" });

    // Limit only ACTIVE admins
    const count = await User.countDocuments({
      role: "admin",
      isActive: true
    });

    if (count >= 10) return res.status(400).json({ error: "Maximum limit of 10 admins reached", redirect: "/admin" });

    const existing = await User.findOne({ email });

    // 🟢 USER ALREADY EXISTS → UPGRADE ROLE
    if (existing) {
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      return res.json({ success: true, user: existing, redirect: "/admin" });
    }

    // 🟢 NEW ADMIN CREATION
    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      password: hashed,
      role: "admin",
      isActive: true,
    });

    res.status(201).json({ success: true, user: newAdmin, redirect: "/admin" });

  } catch (error) {
    console.error("Invite Admin Error:", error);
    res.status(500).json({ error: error.message, redirect: "/admin" });
  }
};


/* =================================
   ACTIVATE / DEACTIVATE ADMIN
================================= */
exports.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ error: "Admin not found", redirect: "/admin" });

    // ❌ Superadmin cannot be deactivated
    if (admin.role === "superadmin") return res.status(400).json({ error: "Superadmin cannot be deactivated", redirect: "/admin" });

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ success: true, user: admin, redirect: "/admin" });
  } catch (error) {
    console.error("Toggle Admin Error:", error);
    res.status(500).json({ error: error.message, redirect: "/admin" });
  }
};

/* =================================
   DELETE ADMIN
================================= */
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    // Safety — cannot delete superadmin
    if (!admin || admin.role === "superadmin") {
      return res.status(400).json({ error: "Admin not found or is superadmin", redirect: "/admin" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, redirect: "/admin" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({ error: error.message, redirect: "/admin" });
  }
};




/* =================================
   CHANGE SUPER ADMIN
================================= */
exports.makeSuperAdmin = async (req, res) => {
  try {
    const newSuperAdmin = await User.findById(req.params.id);
    if (!newSuperAdmin) return res.status(404).json({ error: "Admin not found", redirect: "/admin" });

    // Already superadmin
    if (newSuperAdmin.role === "superadmin") return res.status(400).json({ error: "Already superadmin", redirect: "/admin" });

    // Demote current superadmin
    await User.updateMany(
      { role: "superadmin" },
      { role: "admin" }
    );

    // Promote new one
    newSuperAdmin.role = "superadmin";
    newSuperAdmin.isActive = true; // ensure active
    await newSuperAdmin.save();

    res.json({ success: true, user: newSuperAdmin, redirect: "/admin" });
  } catch (error) {
    console.error("Make Super Admin Error:", error);
    res.status(500).json({ error: error.message, redirect: "/admin" });
  }
};

/* =================================
   UPDATE PROFILE / SETTINGS
================================= */
exports.updateProfile = async (req, res) => {
  try {
    const { email, password, newPassword, confirmPassword } = req.body;
    const userId = req.session.user._id || req.session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found", redirect: "/admin?tab=settings&error=User+not+found" });
    }

    // Update email if changed
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ error: "Email already in use", redirect: "/admin?tab=settings&error=Email+already+in+use" });
      }
      user.email = email;
      req.session.user.email = email; // sync session
    }

    // Update password if current & new password provided
    if (password && newPassword) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: "Incorrect current password", redirect: "/admin?tab=settings&error=Incorrect+current+password" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match", redirect: "/admin?tab=settings&error=New+passwords+do+not+match" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    
    // Sync session user
    req.session.user.role = user.role;
    req.session.user.isActive = user.isActive;

    res.json({ success: true, user, redirect: "/admin?tab=settings&success=Profile+updated+successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: error.message, redirect: "/admin?tab=settings&error=An+error+occurred+while+updating+profile" });
  }
};

