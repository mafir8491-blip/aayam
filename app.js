/* ===============================
   ENV & CORE IMPORTS
================================ */
require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");



require("./config/passport");

/* ===============================
   DATABASE
================================ */
const connectDB = require("./config/db");

/* ===============================
   VIEW & SESSION PACKAGES
================================ */
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { pool } = require("./config/supabase");

/* ===============================
   APP INIT
================================ */
const app = express();

/* TRUST PROXY — Required for secure cookies behind Render/custom domain */
app.set("trust proxy", 1);

/* ===============================
   DATABASE CONNECTION
================================ */
connectDB();

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   SESSION CONFIG
================================ */
const sessionStore = pool
  ? new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true
    })
  : undefined;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

/* ===============================
   PASSPORT (MUST BE AFTER SESSION)
================================ */
app.use(passport.initialize());
app.use(passport.session());

/* ===============================
   GLOBAL USER (NAVBAR ACCESS)
================================ */
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

/* ===============================
   EJS + LAYOUT SETUP (kept for backwards compatibility/assets, not used by controllers)
================================ */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

/* ===============================
   ROUTES
================================ */
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const teamRoutes = require("./routes/teamRoutes");
const homeController = require("./controllers/homeController");
const eventRoutes = require("./routes/eventRoutes");
const reachOutRoutes = require("./routes/reachOutRoutes");
const adminRoutes = require("./routes/adminRoutes");

/* ===============================
   GLOBAL AUTHENTICATION GUARD
================================ */
app.use((req, res, next) => {
  const isStatic = req.path.startsWith("/css/") || 
                   req.path.startsWith("/images/") || 
                   req.path.startsWith("/js/") || 
                   req.path.startsWith("/uploads/") ||
                   req.path.startsWith("/assets/") ||
                   req.path === "/index.html" || 
                   req.path === "/favicon.ico";

  if (isStatic) {
    return next();
  }

  // Helper to determine if endpoint is public
  const isPublicRoute = (r) => {
    const p = r.path;
    const m = r.method;
    
    if (p === "/api" || p === "/") return true;
    if (p === "/api/auth/me") return true;
    if (p === "/api/auth" || p === "/api/auth/email" || p === "/api/auth/google" || p === "/api/auth/google/callback" || p === "/api/logout") return true;
    
    if (p === "/api/events" && m === "GET") return true;
    if (p === "/api/team" && m === "GET") return true;
    if (p === "/api/gallery" && m === "GET") return true;
    if (p === "/api/reachout") return true; // GET/POST both public
    
    if (p.startsWith("/api/events/") && m === "GET") {
      const sub = p.substring(12);
      if (sub === "add") return false;
      if (sub.startsWith("edit/")) return false;
      if (sub.startsWith("delete/")) return false;
      if (sub.includes("/register")) return false; // Needs auth to register
      return true;
    }
    
    if (p.startsWith("/api/events/") && p.endsWith("/reviews") && m === "POST") {
      return true;
    }
    
    return false;
  };

  if (isPublicRoute(req)) {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized", redirect: "/auth" });
  }

  next();
});

/* Prefix route middlewares with /api */
app.use("/api", authRoutes);
app.use("/api", homeRoutes);
app.use("/api", teamRoutes);
app.use("/api", eventRoutes);
app.use("/api", reachOutRoutes);
app.use("/api", adminRoutes);

/* HOME */
app.get("/api", homeController.getHome);
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Aayam API", version: "1.0.0", redirect: "/api" });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler Caught:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

/* ===============================
   SERVER
================================ */
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;