const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ===============================
   AUTH PAGE
=================================*/
exports.authPage = (req, res) => {
  res.json({ message: "Auth page payload" });
};

/* ===============================
   GET CURRENT USER SESSION
=================================*/
exports.getMe = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.json({ user: null });
};


/* ===============================
   EMAIL LOGIN + REGISTER
=================================*/
exports.emailAuth = async (req, res) => {
  try {
    const { name, email, password, mode } = req.body;

    /* ================= REGISTER ================= */
    if (mode === "register") {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashed,
        role: "user", // 🔥 only public users can register
      });

      req.session.user = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: "user",
        isActive: true,
      };

      return res.status(201).json({ success: true, redirect: "/" });
    }

    /* ================= LOGIN ================= */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account disabled" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 🔥 KEEP ORIGINAL ROLE (admin, superadmin, user)
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    req.session.save(() => res.json({ success: true, redirect: "/" }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, redirect: "/auth" });
  }
};


/* ===============================
   LOGOUT
=================================*/
exports.logout = (req, res) => {
  req.session.destroy(() => res.json({ success: true, redirect: "/auth" }));
};

