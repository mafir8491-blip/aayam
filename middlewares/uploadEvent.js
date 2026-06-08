const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let imageStorage;

if (hasCloudinary) {
  imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "aayam/events",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} else {
  console.log("ℹ️ Cloudinary credentials not found. Using local disk storage fallback for event uploads.");
  const uploadDir = path.join(__dirname, "../uploads/events");
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.warn("⚠️ Failed to create local events uploads directory (read-only filesystem on Vercel):", err.message);
  }

  imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"), false);
};

// Documents standard memory storage (for Cloudinary or local saving)
const docMemoryStorage = multer.memoryStorage();

const docFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
  ];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("File type not allowed"), false);
};

// Document uploader helper
const uploadDocToCloud = (buffer, originalname) => {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      if (buffer.length > MAX_DOC_SIZE) {
        return reject(
          new Error(
            `File too large. Maximum allowed is 9MB. Got ${(buffer.length / 1024 / 1024).toFixed(1)}MB`
          )
        );
      }

      const nameWithoutExt = originalname
        .replace(/\s+/g, "_")
        .replace(/\.[^/.]+$/, "");

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "aayam/event-documents",
          resource_type: "raw",
          public_id: Date.now() + "-" + nameWithoutExt,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } else {
    // Local storage fallback for raw documents
    return new Promise((resolve, reject) => {
      try {
        const uploadDir = path.join(__dirname, "../uploads/events");
        try {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
        } catch (err) {
          console.warn("⚠️ Failed to create directory for raw documents:", err.message);
        }
        const nameWithoutExt = originalname
          .replace(/\s+/g, "_")
          .replace(/\.[^/.]+$/, "");
        const ext = path.extname(originalname);
        const filename = `${Date.now()}-${nameWithoutExt}${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`Saved event document locally to: ${filepath}`);
        resolve(`/uploads/events/${filename}`);
      } catch (err) {
        reject(err);
      }
    });
  }
};

// Raw image uploader
const uploadImageRaw = multer({ storage: imageStorage, fileFilter: imageFilter });

// Wrapped image uploader matching Multer's single and array API
const uploadImage = {
  single: (fieldName) => {
    const rawSingle = uploadImageRaw.single(fieldName);
    return (req, res, next) => {
      rawSingle(req, res, (err) => {
        if (err) return next(err);
        if (req.file && !hasCloudinary) {
          req.file.path = `/uploads/events/${req.file.filename}`;
        }
        next();
      });
    };
  },
  array: (fieldName, maxCount) => {
    const rawArray = uploadImageRaw.array(fieldName, maxCount);
    return (req, res, next) => {
      rawArray(req, res, (err) => {
        if (err) return next(err);
        if (req.files && !hasCloudinary) {
          for (let file of req.files) {
            file.path = `/uploads/events/${file.filename}`;
          }
        }
        next();
      });
    };
  }
};

const uploadDoc = multer({
  storage: docMemoryStorage,
  fileFilter: docFilter,
  limits: { fileSize: MAX_DOC_SIZE },
});

const _subEventMulter = multer({ storage: imageStorage, fileFilter: imageFilter }).fields([
  { name: "qrImage",     maxCount: 1 },
  { name: "posterImage", maxCount: 1 },
]);

const uploadSubEventImages = (req, res, next) => {
  _subEventMulter(req, res, (err) => {
    if (err) {
      console.error("SubEvent image upload error (non-fatal):", err.message);
      if (!req.files) req.files = {};
    }
    if (req.files && !hasCloudinary) {
      if (req.files.qrImage && req.files.qrImage[0]) {
        req.files.qrImage[0].path = `/uploads/events/${req.files.qrImage[0].filename}`;
      }
      if (req.files.posterImage && req.files.posterImage[0]) {
        req.files.posterImage[0].path = `/uploads/events/${req.files.posterImage[0].filename}`;
      }
    }
    next();
  });
};

module.exports = { uploadImage, uploadDoc, uploadDocToCloud, uploadSubEventImages };