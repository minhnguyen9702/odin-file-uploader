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

    try {
      await prisma.file.create({
        data: {
          filename: req.file.originalname,
          userId: req.user.id,
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
