const express = require("express");
const folderRouter = express.Router();
const { ensureAuthenticated } = require("../auth");
const folderController = require("../routes/controllers/folderController");

folderRouter.post("/create", ensureAuthenticated, folderController.createNewFolder);
folderRouter.delete("/:id", ensureAuthenticated, folderController.deleteFolder);

module.exports = folderRouter;
