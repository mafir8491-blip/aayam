/* ===============================
   LOGIN CHECK
================================ */
const isLoggedIn = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized", redirect: "/auth" });
  }
  next();
};

/* ===============================
   ADMIN ACCESS (ADMIN + SUPERADMIN)
================================ */
const isAdmin = (req, res, next) => {
  const user = req.session ? req.session.user : null;

  // ❌ Not logged in
  if (!user) {
    return res.status(401).json({ error: "Unauthorized", redirect: "/auth" });
  }

  // ❌ Inactive user
  if (!user.isActive) {
    return res.status(403).json({ error: "User is inactive", redirect: "/events" });
  }

  // ❌ Not admin / superadmin
  if (user.role !== "admin" && user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Admin access required", redirect: "/events" });
  }

  // ✅ Allowed
  next();
};


/* ===============================
   SUPER ADMIN ONLY
================================ */
const isSuperAdmin = (req, res, next) => {
  const user = req.session ? req.session.user : null;

  if (!user) return res.status(401).json({ error: "Unauthorized", redirect: "/auth" });
  if (!user.isActive) return res.status(403).json({ error: "User is inactive", redirect: "/auth" });

  if (user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Superadmin access required", redirect: "/admin" });
  }

  next();
};

module.exports = {
  isLoggedIn,
  isAdmin,
  isSuperAdmin,
};
