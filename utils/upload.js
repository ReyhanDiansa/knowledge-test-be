const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { put } = require("@vercel/blob");
const { responseFormatter } = require("./utils");
require("dotenv");

// Create upload folder if using local storage
const ensureUploadFolder = () => {
  const uploadPath = process.env.LOCAL_UPLOAD_FOLDER || "uploads";
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Local storage configuration
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadFolder());
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Cloud storage helper
const uploadToCloud = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("File buffer is missing for cloud upload");
  }
  const blob = await put(
    `knowledge/uploads/${file.originalname}`,
    file.buffer,
    {
      access: "public",
    }
  );
  return blob.url;
};

const storageCloud = multer.memoryStorage();

const storage = process.env.APP_ENV === "local" ? storageLocal : storageCloud;

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

// Middleware to handle file upload
const handleUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return responseFormatter(
        res,
        400,
        false,
        `File upload failed: ${err}`,
        null
      );
    }

    try {
      if (process.env.APP_ENV !== "local" && req.file) {
        const fileUrl = await uploadToCloud(req.file);
        req.file.location = fileUrl;
      } else if (process.env.APP_ENV === "local" && req.file) {
        req.file.location = `http://localhost:${process.env.PORT}/api/v1/file/${req.file.filename}`;
      }
      next();
    } catch (uploadError) {
      return responseFormatter(
        res,
        500,
        false,
        `File processing failed: ${uploadError.message}`,
        null
      );
    }
  });
};

module.exports = handleUpload;
