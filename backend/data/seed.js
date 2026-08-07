// Remplit la base avec des bourses de démonstration.
// Lance avec: npm run seed

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);
db.defaults({ users: [], profiles: [], scholarships: [], applications: [], documents: [] }).write();

const scholarships = [
  {
    id: uuidv4(),
    title: "Bourse d'excellence Afrique",
    provider: "Université de Montréal",
    country: "Canada",
    levels: ["Licence", "Master"],
    field: "Toutes disciplines",
    deadline: "2026-06-30",
    tag: "Recommandée",
  },
  {
    id: uuidv4(),
    title: "Bourse Chevening",
    provider: "Gouvernement du Royaume-Uni",
    country: "Royaume-Uni",
    levels: ["Master"],
    field: "Toutes disciplines",
    deadline: "2026-07-05",
    tag: "Populaire",
  },
  {
    id: uuidv4(),
    title: "Bourse Eiffel Excellence",
    provider: "Gouvernement Français",
    country: "France",
    levels: ["Master", "PhD"],
    field: "Toutes disciplines",
    deadline: "2026-10-20",
    tag: "Nouvelle",
  },
  {
    id: uuidv4(),
    title: "Mastercard Foundation Scholars",
    provider: "Mastercard Foundation",
    country: "Canada",
    levels: ["Licence", "Master"],
    field: "Toutes disciplines",
    deadline: "2026-08-31",
    tag: null,
  },
  {
    id: uuidv4(),
    title: "Bourse de la Francophonie",
    provider: "OIF",
    country: "France",
    levels: ["Master"],
    field: "Sciences sociales",
    deadline: "2026-09-15",
    tag: null,
  },
];

db.set("scholarships", scholarships).write();
console.log(`✅ ${scholarships.length} bourses ajoutées à la base de données.`);
