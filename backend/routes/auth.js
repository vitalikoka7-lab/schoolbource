const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { supabase, createProfile } = require("../config/db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ error: "Prénom, email et mot de passe sont requis." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà via Supabase Auth
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('email', email.toLowerCase())
      .single();

    // Note: Dans une implémentation complète, on vérifierait dans auth.users
    // Pour l'instant, on vérifie dans profiles
    if (existingUsers) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    // Créer l'utilisateur via Supabase Auth API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName || ""
      }
    });

    if (authError) {
      console.error("Erreur création utilisateur Supabase:", authError);
      // Fallback: création manuelle si admin key n'a pas les droits
      if (authError.message.includes('admin')) {
        return res.status(500).json({ 
          error: "Configuration Supabase incomplète. Contactez l'administrateur.",
          details: "La clé service doit avoir les droits admin pour créer des utilisateurs."
        });
      }
      throw authError;
    }

    const user = authData.user;

    // Créer le profil associé
    await createProfile(user.id);

    // Générer un token JWT pour la session
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { 
        id: user.id, 
        firstName: user.user_metadata?.first_name || firstName, 
        lastName: user.user_metadata?.last_name || lastName, 
        email: user.email 
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);
    res.status(500).json({ error: "Erreur lors de la création du compte." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Connexion via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: (email || "").toLowerCase(),
      password: password || ""
    });

    if (error) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const user = data.user;
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { 
        id: user.id, 
        firstName: user.user_metadata?.first_name || "", 
        lastName: user.user_metadata?.last_name || "", 
        email: user.email 
      },
    });
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

module.exports = router;
