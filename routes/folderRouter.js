const express = require("express");
const folderRouter = express.Router();
const { ensureAuthenticated } = require("../auth");
const folderController = require("../routes/controllers/folderController");

folderRouter.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const folderId = req.params.id;
    const files = await folderController.getFilesInFolder(folderId);
    res.render("folder", { files });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading folder page");
  }
});
folderRouter.post("/create", ensureAuthenticated, folderController.createNewFolder);
folderRouter.post("/delete/:id", ensureAuthenticated, folderController.deleteFolder);

module.exports = folderRouter;
