const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/applications - liste des dossiers de l'utilisateur ("Mes Dossiers")
router.get("/", (req, res) => {
  const apps = db.get("applications").filter({ userId: req.userId }).value();
  res.json(apps);
});

// POST /api/applications - créer un nouveau dossier pour une bourse
// body: { scholarshipId }
router.post("/", (req, res) => {
  const { scholarshipId } = req.body;
  const scholarship = db.get("scholarships").find({ id: scholarshipId }).value();
  if (!scholarship) return res.status(404).json({ error: "Bourse introuvable." });

  const application = {
    id: uuidv4(),
    userId: req.userId,
    scholarshipId,
    scholarshipTitle: scholarship.title,
    status: "en_preparation", // en_preparation | soumis | en_cours | accepte | refuse
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.get("applications").push(application).write();
  res.status(201).json(application);
});

// PUT /api/applications/:id - mettre à jour le statut / la progression d'un dossier
router.put("/:id", (req, res) => {
  const ref = db.get("applications").find({ id: req.params.id, userId: req.userId });
  if (!ref.value()) return res.status(404).json({ error: "Dossier introuvable." });

  const { status, progress } = req.body;
  if (status) ref.set("status", status).write();
  if (typeof progress === "number") ref.set("progress", progress).write();
  ref.set("updatedAt", new Date().toISOString()).write();

  res.json(ref.value());
});

// DELETE /api/applications/:id
router.delete("/:id", (req, res) => {
  db.get("applications").remove({ id: req.params.id, userId: req.userId }).write();
  res.status(204).send();
});

module.exports = router;
