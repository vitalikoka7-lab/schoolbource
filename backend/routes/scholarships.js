const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/scholarships - liste toutes les bourses (avec filtres optionnels)
// query: ?country=Canada&level=Master&search=ia
router.get("/", (req, res) => {
  const { country, level, search } = req.query;
  let results = db.get("scholarships").value();

  if (country) {
    results = results.filter((s) => s.country.toLowerCase() === country.toLowerCase());
  }
  if (level) {
    results = results.filter((s) => s.levels.some((l) => l.toLowerCase() === level.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) => s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// GET /api/scholarships/:id
router.get("/:id", (req, res) => {
  const scholarship = db.get("scholarships").find({ id: req.params.id }).value();
  if (!scholarship) return res.status(404).json({ error: "Bourse introuvable." });
  res.json(scholarship);
});

// GET /api/scholarships/recommended/for-me - bourses recommandées selon le profil
router.get("/recommended/for-me", requireAuth, (req, res) => {
  const profile = db.get("profiles").find({ userId: req.userId }).value();
  const all = db.get("scholarships").value();

  if (!profile) return res.json(all.slice(0, 6));

  const preferredCountries = (profile.goals && profile.goals.preferredCountries) || [];
  const field = profile.goals && profile.goals.field;

  const scored = all.map((s) => {
    let score = 0;
    if (preferredCountries.includes(s.country)) score += 2;
    if (field && s.field && s.field.toLowerCase() === field.toLowerCase()) score += 2;
    return { ...s, matchScore: score };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  res.json(scored.slice(0, 12));
});

module.exports = router;
