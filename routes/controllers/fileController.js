const cloudinary = require("../../cloudinary");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Upload File to Cloudinary
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/file/upload");
    }

    const file = req.files.file;

    console.log("Uploading file to Cloudinary...");

    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "uploder",
    });

    console.log("Cloudinary Response:", result);

    // Save file data to the database
    await prisma.file.create({
      data: {
        filename: file.name,
        fileUrl: result.secure_url,
        userId: req.user.id,
      },
    });

    req.flash("success", "File uploaded successfully.");
    res.redirect("/file/upload");
  } catch (err) {
    console.error("Upload Error:", err);
    req.flash("error", "Error uploading file.");
    res.redirect("/file/upload");
  }
};

// Get Files in Root Folder
exports.getRootFiles = async (req) => {
  try {
    return await prisma.file.findMany({
      where: { userId: req.user.id, folderId: null },
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error; // Re-throw to handle it in the calling function
  }
};

// Delete File
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    // Fetch file from database
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      console.log("File not found in database.");
      return res.status(404).json({ error: "File not found" });
    }

    // Extract Cloudinary public ID
    const publicId = "uploder/" + file.fileUrl.split("/").pop().split(".")[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete file from database
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

// Download File (Redirect to Cloudinary URL)
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).send("File not found!");
    }

    // Redirect to Cloudinary URL
    res.redirect(file.fileUrl);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error");
  }
};