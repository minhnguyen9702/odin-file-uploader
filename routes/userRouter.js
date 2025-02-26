const { Router } = require("express");
const userController = require("../routes/controllers/userController");
const userRouter = Router();

userRouter.post("/sign-up", userController.addNewUser);
userRouter.post("/login", userController.handleLogin);
userRouter.get("/logout", userController.handleLogout);

module.exports = userRouter;
