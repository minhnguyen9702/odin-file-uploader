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
    await prisma.file.deleteMany({
      where: { folderId: req.params.id, userId: req.user.id },
    });
    await prisma.folder.delete({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.redirect("/");
    return;
  } catch (error) {
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
