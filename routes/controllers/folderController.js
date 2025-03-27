const cloudinary = require("../../cloudinary");
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
    const folderId = req.params.id;
    const userId = req.user.id;

    // Fetch all files in the folder
    const files = await prisma.file.findMany({
      where: { folderId, userId },
    });

    if (files.length === 0) {
      console.log("No files found in the folder.");
    }

    // Delete files from Cloudinary
    for (const file of files) {
      // Extract Cloudinary public ID
      const urlParts = file.fileUrl.split("/");
      const fileNameWithExt = urlParts.pop(); // Get last part of the URL (e.g., 'image.png')
      const fileName = fileNameWithExt.split(".")[0]; // Remove file extension

      // Extract folder path (Cloudinary stores full path)
      const folderPath = urlParts.slice(7).join("/"); // Preserve Cloudinary folder structure

      const publicId = `${folderPath}/${fileName}`;

      console.log("Deleting from Cloudinary:", publicId);

      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary Response:", result);
    }

    await prisma.file.deleteMany({
      where: { folderId, userId },
    });

    await prisma.folder.delete({
      where: { id: folderId, userId },
    });

    console.log("Folder and its files deleted successfully.");
    res.redirect("/");
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};


exports.getFilesInFolder = async (folderId) => {
  const files = await prisma.file.findMany({
    where: { folderId },
  });

  return files;
};
