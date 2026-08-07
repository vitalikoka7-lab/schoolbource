require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const scholarshipRoutes = require("./routes/scholarships");
const applicationRoutes = require("./routes/applications");
const documentRoutes = require("./routes/documents");
const agentRoutes = require("./routes/agents");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "5mb" }));

// Limite le nombre de requêtes pour éviter les abus (surtout sur /api/agents,
// qui coûte des tokens API)
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes par fenêtre
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});
app.use("/api/", limiter);

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "2.0.0-supabase"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/agents", agentRoutes);

// Fichiers uploadés - non utilisé avec Supabase Storage mais gardé pour compatibilité
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res) => res.status(404).json({ error: "Route introuvable." }));

app.use((err, req, res, next) => {
  console.error("Erreur globale:", err);
  res.status(500).json({ 
    error: "Erreur interne du serveur.",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ ScholarPass backend (Supabase) démarré sur http://localhost:${PORT}`);
  console.log(`📊 Connected to Supabase: ${process.env.SUPABASE_URL ? 'OK' : 'MISSING'}`);
  console.log(`🤖 Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'OK' : 'MISSING'}`);
});
