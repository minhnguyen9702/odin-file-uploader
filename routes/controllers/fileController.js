const upload = require("../../multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadFile = [
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/file/upload");
    }

    const { folderId } = req.body; // Read folderId from form data

    try {
      await prisma.file.create({
        data: {
          filename: req.file.originalname, // Store original filename
          userId: req.user.id,
          folderId: folderId || null, // Associate file with a folder if provided
        },
      });

      req.flash("success", "File uploaded successfully.");
      res.redirect("/file/upload");
    } catch (err) {
      console.error(err);
      req.flash("error", "Error saving file data.");
      res.redirect("/file/upload");
    }
  },
];

