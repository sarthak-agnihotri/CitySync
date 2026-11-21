
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, "grievance-" + uniqueSuffix + ext);
  }
});

const allowedTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"]
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = allowedTypes[ext];

  if (allowedMimes && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Only image files (JPG, PNG, WebP) are allowed!"
    );
    error.statusCode = 400;
    cb(error);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;
