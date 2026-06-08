require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  const email = "yashanoswaal05@gmail.com";
  const rawPassword = "Yashan@0611";

  try {
    console.log(`Hashing password with bcryptjs...`);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    console.log(`Upserting user ${email} as superadmin...`);
    const upsertedUser = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          name: "Yashan Oswaal",
          email: email,
          password: hashedPassword,
          role: "superadmin",
          isActive: true
        }
      },
      { upsert: true }
    );

    console.log("✅ Success! Upserted User details:");
    console.log(JSON.stringify(upsertedUser, null, 2));

  } catch (error) {
    console.error("❌ Failed to upsert admin user:", error.message || error);
  }
  process.exit(0);
}

run();
