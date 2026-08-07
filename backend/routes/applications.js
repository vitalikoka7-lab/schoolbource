const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { supabase, getUserById } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/applications - liste des dossiers de l'utilisateur ("Mes Dossiers")
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        scholarships (
          id,
          title,
          provider,
          country,
          deadline
        )
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Erreur récupération candidatures:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des candidatures." });
  }
});

// POST /api/applications - créer un nouveau dossier pour une bourse
// body: { scholarshipId }
router.post("/", async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    
    // Vérifier que la bourse existe
    const { data: scholarship, error: checkError } = await supabase
      .from('scholarships')
      .select('id, title')
      .eq('id', scholarshipId)
      .single();
    
    if (checkError || !scholarship) {
      return res.status(404).json({ error: "Bourse introuvable." });
    }
    
    const application = {
      user_id: req.userId,
      scholarship_id: scholarshipId,
      status: 'en_preparation',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newApp, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      ...newApp,
      scholarshipTitle: scholarship.title
    });
  } catch (err) {
    console.error("Erreur création candidature:", err);
    res.status(500).json({ error: "Erreur lors de la création de la candidature." });
  }
});

// PUT /api/applications/:id - mettre à jour le statut / la progression d'un dossier
router.put("/:id", async (req, res) => {
  try {
    const { status, progress } = req.body;
    
    const updateData = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (typeof progress === 'number') updateData.progress = progress;
    
    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Dossier introuvable." });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error("Erreur mise à jour candidature:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la candidature." });
  }
});

// DELETE /api/applications/:id
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    console.error("Erreur suppression candidature:", err);
    res.status(500).json({ error: "Erreur lors de la suppression de la candidature." });
  }
});

module.exports = router;
