// Base de données simple basée sur un fichier JSON (lowdb).
// Pratique pour démarrer/tester rapidement. Pour la production,
// il est recommandé de migrer vers PostgreSQL ou MongoDB
// (la structure des routes/models a été pensée pour rendre ce
// changement facile plus tard).

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "..", "data", "db.json"));
const db = low(adapter);

// Structure par défaut de la base de données
db.defaults({
  users: [],
  profiles: [],
  scholarships: [],
  applications: [],
  documents: [],
}).write();

module.exports = db;
