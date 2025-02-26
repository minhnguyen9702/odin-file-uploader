const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const { PrismaClient } = require("@prisma/client");
const PrismaSessionStore =
  require("@quixo3/prisma-session-store").PrismaSessionStore;

const prisma = new PrismaClient();

const app = express();

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

// use ejs for views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const userRouter = require("./routes/userRouter");
app.use("/user", userRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));