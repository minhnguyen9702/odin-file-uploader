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
      checkPeriod: 2 * 60 * 1000, // Clean expired sessions every 2 minutes
      dbRecordIdIsSessionId: true, // Explicitly set this option
      explicitNull: true, // Fixes issues with nullable fields in some setups
    }),
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in successfully", user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ message: "Logged out" });
  });
});

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.user);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
