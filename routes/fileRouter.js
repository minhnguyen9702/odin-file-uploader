const express = require("express");
const fileRouter = express.Router();
const { ensureAuthenticated } = require("../auth");
const fileController = require("../routes/controllers/fileController");

fileRouter.get("/upload", ensureAuthenticated, (req, res) => {
  res.render("upload");
});
fileRouter.post("/upload", ensureAuthenticated, fileController.uploadFile);

module.exports = fileRouter;
