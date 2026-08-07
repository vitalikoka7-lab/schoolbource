const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { supabase, getUserById } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Configuration pour le stockage Supabase Storage
// Bucket 'documents' doit être créé dans Supabase Dashboard → Storage
const BUCKET_NAME = 'documents';

// GET /api/documents - liste des documents de l'utilisateur
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.userId)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Erreur récupération documents:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des documents." });
  }
});

// POST /api/documents - upload d'un document (bulletin, diplôme, CV...)
// Note: Pour Supabase Storage, le frontend devrait uploader directement via presigned URL
// Cette route crée d'abord l'entrée en base, le frontend fait l'upload ensuite
router.post("/", async (req, res) => {
  try {
    const { type, originalName, storagePath, mimeType, fileSize } = req.body;
    
    if (!type || !originalName || !storagePath) {
      return res.status(400).json({ error: "Champs requis: type, originalName, storagePath" });
    }
    
    const allowedTypes = ['bulletin', 'diplome', 'cv', 'lettre', 'certificat', 'passeport', 'autre'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: `Type invalide. Attendu: ${allowedTypes.join(', ')}` });
    }
    
    const doc = {
      user_id: req.userId,
      type,
      original_name: originalName,
      stored_name: path.basename(storagePath),
      storage_path: storagePath,
      mime_type: mimeType || null,
      file_size: fileSize || null,
      extracted_data: {},
      is_processed: false
    };
    
    const { data: newDoc, error } = await supabase
      .from('documents')
      .insert(doc)
      .select()
      .single();
    
    if (error) throw error;
    
    // Mettre à jour le profil avec la référence du document
    const profile = await getUserById(req.userId);
    if (profile) {
      const currentDocs = profile.documents || [];
      await supabase
        .from('profiles')
        .update({ documents: [...currentDocs, newDoc.id] })
        .eq('user_id', req.userId);
    }
    
    res.status(201).json(newDoc);
  } catch (err) {
    console.error("Erreur création document:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout du document." });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    // Récupérer le document pour supprimer aussi le fichier
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: "Document introuvable." });
      }
      throw fetchError;
    }
    
    // Supprimer le fichier du storage
    if (doc.storage_path) {
      const { error: deleteError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([doc.storage_path]);
      
      if (deleteError) {
        console.error("Erreur suppression fichier storage:", deleteError);
        // Continuer quand même pour supprimer l'entrée en base
      }
    }
    
    // Supprimer l'entrée en base
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    console.error("Erreur suppression document:", err);
    res.status(500).json({ error: "Erreur lors de la suppression du document." });
  }
});

// GET /api/documents/:id/presigned-url - génère une URL signée pour téléchargement
router.get("/:id/presigned-url", async (req, res) => {
  try {
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: "Document introuvable." });
      }
      throw fetchError;
    }
    
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.storage_path, 300); // URL valide 5 minutes
    
    if (error) throw error;
    
    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error("Erreur génération URL signée:", err);
    res.status(500).json({ error: "Erreur lors de la génération de l'URL." });
  }
});

module.exports = router;
