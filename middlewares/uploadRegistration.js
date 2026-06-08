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
    params: async (req, file) => {
      const mimeLower = file.mimetype.toLowerCase();
      const isImage = /jpeg|jpg|png|webp|heic|heif/.test(mimeLower);

      return {
        folder: "aayam/registrations",
        resource_type: isImage ? "image" : "raw",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf", "doc", "docx"],
        transformation: isImage ? [{ quality: "auto", fetch_format: "auto" }] : undefined,
      };
    },
  });
} else {
  console.log("ℹ️ Cloudinary credentials not found. Using local disk storage fallback for registration uploads.");
  const uploadDir = path.join(__dirname, "../uploads/registrations");
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

const uploadRegistrationRaw = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
}).any();

const uploadRegistration = (req, res, next) => {
  uploadRegistrationRaw(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      console.error("Multer error:", err.message);
      const subEventId = req.params.subEventId;
      return res.redirect(subEventId ? `/register/${subEventId}?error=filesize` : "/events");
    } else if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.message);
      const subEventId = req.params.subEventId;
      return res.redirect(subEventId ? `/register/${subEventId}?error=upload` : "/events");
    } else if (err) {
      console.error("Upload error:", err.message);
      const subEventId = req.params.subEventId;
      return res.redirect(subEventId ? `/register/${subEventId}?error=upload` : "/events");
    }
    
    if (req.files && !hasCloudinary) {
      for (let file of req.files) {
        file.path = `/uploads/registrations/${file.filename}`;
      }
    }
    next();
  });
};

module.exports = uploadRegistration;