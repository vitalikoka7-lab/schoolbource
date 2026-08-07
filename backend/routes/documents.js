const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// Limite la taille (10 Mo) et n'accepte que les formats de documents courants
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier non supporté."));
    }
  },
});

// POST /api/documents - upload d'un document (bulletin, diplôme, CV...)
// form-data: file, type ("bulletin" | "diplome" | "cv" | "lettre" | "certificat" | "passeport")
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });

  const doc = {
    id: uuidv4(),
    userId: req.userId,
    type: req.body.type || "autre",
    originalName: req.file.originalname,
    storedName: req.file.filename,
    uploadedAt: new Date().toISOString(),
    // Rempli plus tard par l'agent d'extraction (agents.js -> /extract-document)
    extracted: null,
  };

  db.get("documents").push(doc).write();

  const profileRef = db.get("profiles").find({ userId: req.userId });
  if (profileRef.value()) {
    const docs = profileRef.get("documents").value() || [];
    profileRef.set("documents", [...docs, doc.id]).write();
  }

  res.status(201).json(doc);
});

// GET /api/documents - liste des documents de l'utilisateur
router.get("/", (req, res) => {
  res.json(db.get("documents").filter({ userId: req.userId }).value());
});

module.exports = router;
