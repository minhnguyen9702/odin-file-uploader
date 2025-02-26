const { Router } = require("express");
const userController = require("../routes/controllers/userController");
const userRouter = Router();

userRouter.get("/sign-up", (req, res) => {
  res.render("signup");
});
userRouter.post("/sign-up", userController.addNewUser);
userRouter.get("/login", (req, res) => {
  res.render("login");
});
userRouter.post("/login", userController.handleLogin);
userRouter.get("/logout", userController.handleLogout);

module.exports = userRouter;
