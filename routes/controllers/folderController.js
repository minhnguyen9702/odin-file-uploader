const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createNewFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.create({
      data: {
        name: req.body.folderName,
        userId: req.user.id,
      },
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

exports.getUserFolders = async (req) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    return folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw new Error("Failed to fetch folders");
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    // Fetch files to delete
    const files = await prisma.file.findMany({
      where: { folderId: req.params.id, userId: req.user.id },
    });
    if (files.length === 0) {
      console.log("No files found in the folder.");
    }
    // Delete files from disk
    for (const file of files) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        file.uniqueFileName
      );
      console.log("Attempting to delete:", filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted:", filePath);
      } else {
        console.log("File not found:", filePath);
      }
    }
    // Delete references from database
    await prisma.file.deleteMany({
      where: { folderId: req.params.id, userId: req.user.id },
    });
    // Delete folder from database
    await prisma.folder.delete({
      where: { id: req.params.id, userId: req.user.id },
    });
    console.log("Folder and its files deleted successfully.");
    res.redirect("/");
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
