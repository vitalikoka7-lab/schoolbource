const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { computeCompletion } = require("../utils/completion");

const router = express.Router();
router.use(requireAuth);

// GET /api/profile - récupère le profil de l'utilisateur connecté
router.get("/", (req, res) => {
  const profile = db.get("profiles").find({ userId: req.userId }).value();
  if (!profile) return res.status(404).json({ error: "Profil introuvable." });
  res.json(profile);
});

// PUT /api/profile - met à jour une section du profil
// body: { section: "personalInfo" | "education" | "skills" | "experiences" | "goals" | "strengths" | "weaknesses", data: ... }
router.put("/", (req, res) => {
  const { section, data } = req.body;
  const allowed = ["personalInfo", "education", "skills", "experiences", "goals", "strengths", "weaknesses"];

  if (!allowed.includes(section)) {
    return res.status(400).json({ error: `Section invalide. Attendu: ${allowed.join(", ")}` });
  }

  const profileRef = db.get("profiles").find({ userId: req.userId });
  if (!profileRef.value()) return res.status(404).json({ error: "Profil introuvable." });

  profileRef.set(section, data).write();

  const updated = profileRef.value();
  const completion = computeCompletion(updated);
  profileRef.set("completion", completion).write();

  res.json({ ...updated, completion });
});

module.exports = router;
