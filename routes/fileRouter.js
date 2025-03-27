const express = require("express");
const fileRouter = express.Router();
const { ensureAuthenticated } = require("../auth");
const fileController = require("../routes/controllers/fileController");
const { getUserFolders } = require("./controllers/folderController");

fileRouter.get("/upload", ensureAuthenticated, async (req, res) => {
  try {
    const folders = await getUserFolders(req); // Call the function to fetch folders
    res.render("upload", { folders }); // Pass folders to the template
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading upload page.");
  }
});
fileRouter.post("/upload", ensureAuthenticated, fileController.uploadFile);
fileRouter.post("/delete/:id", ensureAuthenticated, fileController.deleteFile);
fileRouter.get("/download/:id", ensureAuthenticated, fileController.downloadFile);

module.exports = fileRouter;
