const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { supabase, getUserById } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/scholarships - liste toutes les bourses (avec filtres optionnels)
// query: ?country=Canada&level=Master&search=ia
router.get("/", async (req, res) => {
  try {
    const { country, level, search } = req.query;
    
    let query = supabase.from('scholarships').select('*').eq('active', true);
    
    if (country) {
      query = query.eq('country', country);
    }
    if (level) {
      // Pour les tableaux, on utilise l'opérateur contains
      query = query.contains('levels', [level]);
    }
    if (search) {
      // Recherche textuelle simple (à améliorer avec full-text search PostgreSQL)
      const q = search.toLowerCase();
      const { data: all } = await query;
      const results = all.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.provider.toLowerCase().includes(q)
      );
      return res.json(results);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error("Erreur récupération bourses:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des bourses." });
  }
});

// GET /api/scholarships/:id
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: "Bourse introuvable." });
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error("Erreur récupération bourse:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de la bourse." });
  }
});

// GET /api/scholarships/recommended/for-me - bourses recommandées selon le profil
router.get("/recommended/for-me", requireAuth, async (req, res) => {
  try {
    const profile = await getUserById(req.userId);
    
    if (!profile) {
      // Si pas de profil, retourner les bourses featured
      const { data } = await supabase
        .from('scholarships')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .limit(6);
      return res.json(data || []);
    }
    
    const preferredCountries = profile.preferred_countries || [];
    const field = profile.goals?.field;
    
    // Récupérer toutes les bourses actives
    const { data: all } = await supabase
      .from('scholarships')
      .select('*')
      .eq('active', true);
    
    if (!all) return res.json([]);
    
    // Calculer un score de compatibilité
    const scored = all.map((s) => {
      let score = 0;
      if (preferredCountries.includes(s.country)) score += 2;
      if (field && s.field && s.field.toLowerCase() === field.toLowerCase()) score += 2;
      if (s.featured) score += 1;
      return { ...s, matchScore: score };
    });
    
    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored.slice(0, 12));
  } catch (err) {
    console.error("Erreur recommandation bourses:", err);
    res.status(500).json({ error: "Erreur lors de la recommandation des bourses." });
  }
});

module.exports = router;
