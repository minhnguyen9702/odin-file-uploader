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

    let { folderId } = req.body;
    folderId = folderId === "" ? null : folderId;

    try {
      await prisma.file.create({
        data: {
          filename: req.file.originalname, // Original file name
          uniqueFileName: req.file.filename, // Unique file name (timestamp + original name)
          userId: req.user.id,
          folderId,
        },
      });

      req.flash("success", "File uploaded successfully.");
      res.redirect("/file/upload");
    } catch (err) {
      console.error("Upload Error:", err);
      req.flash("error", "Error saving file data.");
      res.redirect("/file/upload");
    }
  },
];

exports.getRootFiles = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id, folderId: null },
    });
    return(files)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch root files" });
  }
};