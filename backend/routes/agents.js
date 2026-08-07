const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const { requireAuth } = require("../middleware/auth");
const { AGENTS } = require("../utils/agents");
const { supabase, getUserById } = require("../config/db");

const router = express.Router();
router.use(requireAuth);

// La clé API n'est JAMAIS envoyée au frontend : elle reste ici, côté
// serveur, lue depuis la variable d'environnement ANTHROPIC_API_KEY.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askAgent(agentKey, userMessage) {
  const agent = AGENTS[agentKey];
  if (!agent) throw new Error(`Agent inconnu: ${agentKey}`);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    system: agent.system,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return text;
}

// POST /api/agents/onboarding
// body: { answer: "Décris la vie que tu aimerais avoir dans 10 ans" -> réponse libre }
// Utilise l'agent "domaine" + "pays" pour extraire objectif/pays/domaine dès la 1ère réponse
router.post("/onboarding", async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: "Le champ 'answer' est requis." });

    const prompt = `Voici la réponse d'un étudiant à la question "Décris la vie que tu aimerais avoir dans 10 ans" : "${answer}". Extrais en JSON les clés: careerGoal, preferredCountries (liste), field, impactRegion.`;
    const raw = await askAgent("domaine", prompt);

    // Sauvegarde dans le profil
    const profile = await getUserById(req.userId);
    if (profile) {
      const currentGoals = profile.goals || {};
      await supabase
        .from('profiles')
        .update({ 
          goals: { ...currentGoals, lifeIn10Years: answer },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.userId);
    }

    res.json({ raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'analyse par l'IA." });
  }
});

// POST /api/agents/chat  (Nova, le coach conversationnel)
// body: { message, history: [{role, content}, ...] }
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const agent = AGENTS.coach;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system: agent.system,
      messages: [...history, { role: "user", content: message }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la conversation avec Nova." });
  }
});

// POST /api/agents/strengths - analyse Forces / Faiblesses / À améliorer
// body: { freeText: description libre de l'étudiant sur lui-même }
router.post("/strengths", async (req, res) => {
  try {
    const { freeText } = req.body;
    if (!freeText) return res.status(400).json({ error: "Le champ 'freeText' est requis." });

    const raw = await askAgent("personnalite", freeText);
    
    // Parser la réponse JSON et sauvegarder dans le profil
    try {
      const analysis = JSON.parse(raw);
      await supabase
        .from('profiles')
        .update({ 
          personality_analysis: analysis,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.userId);
    } catch (parseErr) {
      console.error("Erreur parsing JSON IA:", parseErr);
    }
    
    res.json({ raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'analyse par l'IA." });
  }
});

// POST /api/agents/match-score - calcule le score de compatibilité profil <-> bourse
// body: { scholarshipId }
router.post("/match-score", async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    
    const profile = await getUserById(req.userId);
    
    const { data: scholarship, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', scholarshipId)
      .single();
    
    if (error || !profile || !scholarship) {
      return res.status(404).json({ error: "Profil ou bourse introuvable." });
    }

    const prompt = `Profil étudiant: ${JSON.stringify(profile)}\nBourse: ${JSON.stringify(scholarship)}`;
    const raw = await askAgent("strategie", prompt);
    
    res.json({ raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du calcul du score." });
  }
});

module.exports = router;
