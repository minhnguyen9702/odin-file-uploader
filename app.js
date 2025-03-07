const path = require("node:path");
const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const connectFlash = require("connect-flash");
const passport = require("./auth");
const { ensureAuthenticated } = require("./auth");
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
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

// making sure user is global and can be accessed from any route
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
  res.locals.successMessage = req.flash("success");
  next();
});

//importing routers
const userRouter = require("./routes/userRouter");
const fileRouter = require("./routes/fileRouter");
const folderRouter = require("./routes/folderRouter");
const { getUserFolders } = require("./routes/controllers/folderController");
const { getRootFiles } = require("./routes/controllers/fileController");


//setting up routes
app.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const folders = await getUserFolders(req);
    const files = await getRootFiles(req);
    res.render("index", { folders, files });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading index page");
  }
});
app.use("/user", userRouter);
app.use("/file", fileRouter);
app.use("/folder", folderRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
