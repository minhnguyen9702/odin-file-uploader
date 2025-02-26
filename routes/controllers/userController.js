const passport = require("../../auth");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

exports.addNewUser = async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/user/sign-up");
  }
  try {
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });
    if (existingUser) {
      req.flash("error", "Username already taken. Please use a different one");
      return res.redirect("/user/sign-up");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { username, password: hashedPassword },
    });
    res.redirect("/user/login");
  } catch (err) {
    req.flash(
      "error",
      err.message || "An error occurred while creating the user."
    );
    res.redirect("/user/sign-up");
  }
};

exports.handleLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: "Incorrect username or password. Please try again",
  })(req, res, next);
};

exports.handleLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie("connect.sid", { path: "/" });
      res.redirect("/");
    });
  });
};
