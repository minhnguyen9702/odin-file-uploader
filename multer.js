const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp + original filename
    cb(file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
