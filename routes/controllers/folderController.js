const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createNewFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.create({
      data: {
        name: req.body.folderName, // ✅ Make sure this matches the form input name
        userId: req.user.id,
      },
    });

    console.log("Folder created:", folder); // ✅ Debugging step to confirm folder creation

    res.redirect("/"); // ✅ Redirect back to the previous page after success
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
    await prisma.folder.delete({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ message: "Folder deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
