const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  console.log("=== ACTUAL .env FILE CONTENTS ===");
  console.log(content);
} else {
  console.log(".env file not found");
}
