const { Router } = require("express");
const userController = require("../routes/controllers/userController");
const userRouter = Router();

const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

userRouter.get("/sign-up", redirectIfAuthenticated, (req, res) => {
  res.render("signup");
});
userRouter.post("/sign-up", redirectIfAuthenticated, userController.addNewUser);
userRouter.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login");
});
userRouter.post("/login", redirectIfAuthenticated, userController.handleLogin);
userRouter.get("/logout", userController.handleLogout);

module.exports = userRouter;
