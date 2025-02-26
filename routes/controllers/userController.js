const passport = require("../../auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addNewUser = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
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
