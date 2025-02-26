const path = require("node:path");
const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const passport = require("./auth");
const { PrismaClient } = require("@prisma/client");
const PrismaSessionStore =
  require("@quixo3/prisma-session-store").PrismaSessionStore;

const prisma = new PrismaClient();

const app = express();
// use ejs for views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      sessionModel: "Session",
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      explicitNull: true,
    }),
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// authentication middleware + making sure user is global
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = {
      id: req.user.id,
      username: req.user.username,
    };
  } else {
    res.locals.user = null;
  }
  res.locals.errorMessage = req.flash("error");
  next();
});

//importing routers
const userRouter = require("./routes/userRouter");

//setting up routes
app.get("/", ensureAuthenticated, (req, res) => {
  res.render("index", { user: req.user });
});
app.use("/user", userRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
