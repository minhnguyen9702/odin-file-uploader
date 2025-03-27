const cloudinary = require("../../cloudinary");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

// Upload File to Cloudinary
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/file/upload");
    }

    const file = req.files.file;
    const folderId = req.body.folderId || null;

    const userId = req.user.id;

    if (!userId) {
      req.flash("error", "User must be authenticated.");
      return res.redirect("/file/upload");
    }

    let cloudinaryFolder = `uploder/${userId}`;

    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        req.flash("error", "Selected folder does not exist.");
        return res.redirect("/file/upload");
      }
    }

    console.log(`Uploading file to Cloudinary folder: ${cloudinaryFolder}`);

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: cloudinaryFolder,
    });

    console.log("Cloudinary Response:", result);

    await prisma.file.create({
      data: {
        filename: file.name,
        fileUrl: result.secure_url,
        userId: req.user.id,
        folderId: folderId,
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

exports.getRootFiles = async (req) => {
  try {
    return await prisma.file.findMany({
      where: { userId: req.user.id, folderId: null },
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    if (!userId) {
      req.flash("error", "User must be authenticated.");
      return res.redirect("/file/upload");
    }

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      console.log("File not found in database.");
      return res.status(404).json({ error: "File not found" });
    }

    // Extract Cloudinary public ID
    const urlParts = file.fileUrl.split("/");
    const fileNameWithExt = urlParts.pop(); // Get last part of the URL (e.g., 'image.png')
    const fileName = fileNameWithExt.split(".")[0]; // Remove file extension (e.g., 'image')

    const folderPath = urlParts.slice(7).join("/");

    const publicId = `${folderPath}/${fileName}`;

    console.log("Deleting from Cloudinary:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary Response:", result);

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
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).send("File not found!");
    }

    console.log("Downloading from:", file.fileUrl);

    // Fetch the file from Cloudinary
    const response = await axios.get(file.fileUrl, { responseType: "stream" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.filename)}"`
    );
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Pipe file data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error");
  }
};