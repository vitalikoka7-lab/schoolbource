/**
 * Configuration Supabase pour ScholarPass
 * 
 * Remplace lowdb par Supabase PostgreSQL pour la production
 * avec Row Level Security (RLS) et stockage cloud
 */

const { createClient } = require('@supabase/supabase-js');

// Initialisation du client Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clé service pour le backend

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes');
  console.error('Vérifiez votre fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false // Backend n'a pas besoin de persister les sessions
  }
});

/**
 * Helper: Récupérer un utilisateur par son ID
 * @param {string} userId - UUID de l'utilisateur
 * @returns {Promise<Object|null>}
 */
async function getUserById(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

/**
 * Helper: Créer un profil pour un nouvel utilisateur
 * @param {string} userId - UUID de l'utilisateur (de auth.users)
 * @returns {Promise<Object>}
 */
async function createProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      completion_percentage: 0,
      personal_info: {},
      education: [],
      skills: [],
      experiences: [],
      goals: {},
      preferred_countries: [],
      refused_countries: [],
      financial_needs: {},
      personality_analysis: {}
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Helper: Mettre à jour une section du profil
 * @param {string} userId - UUID de l'utilisateur
 * @param {string} section - Nom de la section
 * @param {any} data - Données à mettre à jour
 * @returns {Promise<Object>}
 */
async function updateProfileSection(userId, section, data) {
  const column = getProfileColumn(section);
  
  const { data: result, error } = await supabase
    .from('profiles')
    .update({ [column]: data, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

/**
 * Helper: Mapper le nom de section vers la colonne DB
 * @param {string} section 
 * @returns {string}
 */
function getProfileColumn(section) {
  const mapping = {
    personalInfo: 'personal_info',
    education: 'education',
    skills: 'skills',
    experiences: 'experiences',
    goals: 'goals',
    strengths: 'personality_analysis',
    weaknesses: 'personality_analysis',
    preferredCountries: 'preferred_countries',
    refusedCountries: 'refused_countries',
    financialNeeds: 'financial_needs'
  };
  return mapping[section] || section;
}

/**
 * Helper: Calculer le pourcentage de complétion
 * @param {Object} profile 
 * @returns {number}
 */
function computeCompletion(profile) {
  let score = 0;
  
  if (profile.personal_info && Object.keys(profile.personal_info).length > 0) score += 20;
  if (profile.education && profile.education.length > 0) score += 20;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.experiences && profile.experiences.length > 0) score += 15;
  if (profile.goals && profile.goals.lifeIn10Years) score += 15;
  if (profile.preferred_countries && profile.preferred_countries.length > 0) score += 10;
  if (profile.financial_needs && Object.keys(profile.financial_needs).length > 0) score += 5;
  
  return Math.min(100, score);
}

module.exports = {
  supabase,
  getUserById,
  createProfile,
  updateProfileSection,
  computeCompletion
};
