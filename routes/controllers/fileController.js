const upload = require("../../multer");
const fs = require("fs");
const path = require("path");
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
    return files;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch root files" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id; // Fix param name
    const userId = req.user.id;

    // Fetch file from database
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      console.log("File not found in database.");
      return res.status(404).json({ error: "File not found" });
    }

    // Construct file path
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      file.uniqueFileName
    );
    console.log("Attempting to delete:", filePath);

    // Delete file from disk asynchronously
    try {
      await fs.promises.unlink(filePath);
      console.log("Deleted from disk:", filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("File not found on disk:", filePath);
      } else {
        throw err; // Handle unexpected errors
      }
    }

    // Delete file reference from database
    await prisma.file.delete({
      where: { id: fileId },
    });

    console.log("File deleted successfully.");
    res.redirect(req.get("Referer") || "/");
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { uniqueFileName } = req.params;

    const file = await prisma.file.findUnique({
      where: { uniqueFileName },
    });

    if (!file) {
      return res.status(404).send("File not found!");
    }

    const filePath = path.join(__dirname, "../../uploads", file.uniqueFileName);

    // Send the file for download
    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error");
  }
};