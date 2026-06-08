/* ===============================
   ENV & CORE IMPORTS
================================ */
require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");

// Global override to support both MongoDB ObjectIds and PostgreSQL UUIDs in validations
const mongoose = require("mongoose");
const OriginalObjectId = mongoose.Types.ObjectId;
mongoose.Types.ObjectId = function(val) {
  if (typeof val === "string" && (val.length === 24 || val.length === 12)) {
    return new OriginalObjectId(val);
  }
  return val;
};
mongoose.Types.ObjectId.isValid = function(val) {
  if (typeof val !== "string") return false;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(val);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
  return isObjectId || isUUID;
};

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
      createTableIfMissing: false
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
   EJS + LAYOUT SETUP
================================ */
app.set("view engine", "ejs");
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
  const publicPaths = [
    "/auth",
    "/auth/email",
    "/auth/google",
    "/auth/google/callback",
    "/logout"
  ];

  const isStatic = req.path.startsWith("/css/") || 
                   req.path.startsWith("/images/") || 
                   req.path.startsWith("/js/") || 
                   req.path.startsWith("/uploads/");

  if (publicPaths.includes(req.path) || isStatic) {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res.redirect("/auth");
  }

  next();
});

app.use(authRoutes);
app.use(homeRoutes);
app.use(teamRoutes);
app.use(eventRoutes);
app.use(reachOutRoutes);
app.use(adminRoutes);

/* HOME */
app.get("/", homeController.getHome);

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Trigger nodemon reload for .env config update