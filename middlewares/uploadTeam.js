const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;

if (hasCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "aayam/team",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} else {
  console.log("ℹ️ Cloudinary credentials not found. Using local disk storage fallback for team uploads.");
  const uploadDir = path.join(__dirname, "../uploads/team");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const uploadTeamRaw = multer({ storage });

const uploadTeam = {
  single: (fieldName) => {
    const rawSingle = uploadTeamRaw.single(fieldName);
    return (req, res, next) => {
      rawSingle(req, res, (err) => {
        if (err) return next(err);
        if (req.file && !hasCloudinary) {
          req.file.path = `/uploads/team/${req.file.filename}`;
        }
        next();
      });
    };
  }
};

module.exports = uploadTeam;