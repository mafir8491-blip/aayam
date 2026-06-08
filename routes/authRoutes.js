const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const passport = require("passport");

/* ===============================
   AUTH PAGE (Login + Signup UI)
================================ */
router.get("/auth", auth.authPage);
router.get("/auth/me", auth.getMe);

/* ===============================
   EMAIL LOGIN / SIGNUP
================================ */
router.post("/auth/email", auth.emailAuth);



/* ===============================
   LOGOUT
================================ */
router.get("/logout", auth.logout);

module.exports = router;