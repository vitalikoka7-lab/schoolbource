const express = require("express");
const { supabase, getUserById, updateProfileSection, computeCompletion } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/profile - récupère le profil de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const profile = await getUserById(req.userId);
    if (!profile) return res.status(404).json({ error: "Profil introuvable." });
    res.json(profile);
  } catch (err) {
    console.error("Erreur récupération profil:", err);
    res.status(500).json({ error: "Erreur lors de la récupération du profil." });
  }
});

// PUT /api/profile - met à jour une section du profil
// body: { section: "personalInfo" | "education" | "skills" | "experiences" | "goals" | "strengths" | "weaknesses", data: ... }
router.put("/", async (req, res) => {
  const { section, data } = req.body;
  const allowed = ["personalInfo", "education", "skills", "experiences", "goals", "strengths", "weaknesses", "preferredCountries", "refusedCountries", "financialNeeds"];

  if (!allowed.includes(section)) {
    return res.status(400).json({ error: `Section invalide. Attendu: ${allowed.join(", ")}` });
  }

  try {
    // Mettre à jour la section
    const updated = await updateProfileSection(req.userId, section, data);
    
    // Recalculer le pourcentage de complétion
    const completion = computeCompletion(updated);
    
    // Mettre à jour completion_percentage
    const { data: finalProfile, error } = await supabase
      .from('profiles')
      .update({ completion_percentage: completion })
      .eq('user_id', req.userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ ...finalProfile, completion });
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
});

module.exports = router;
