const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ error: "Prénom, email et mot de passe sont requis." });
  }

  const existing = db.get("users").find({ email: email.toLowerCase() }).value();
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    firstName,
    lastName: lastName || "",
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.get("users").push(user).write();

  // Crée un profil vide associé, prêt à être rempli par l'assistant Nova
  db.get("profiles")
    .push({
      userId: user.id,
      completion: 0,
      personalInfo: {},
      education: [],
      skills: [],
      experiences: [],
      documents: [],
      strengths: [],
      weaknesses: [],
      goals: { lifeIn10Years: "" },
    })
    .write();

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.get("users").find({ email: (email || "").toLowerCase() }).value();

  if (!user) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const valid = await bcrypt.compare(password || "", user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
  });
});

module.exports = router;
