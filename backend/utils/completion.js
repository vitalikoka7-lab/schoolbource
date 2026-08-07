// Calcule le pourcentage de complétion du profil, comme sur le tableau
// de bord ("Profil complété : 78%"). Chaque section rapporte des points.

const WEIGHTS = {
  personalInfo: 20,
  education: 20,
  skills: 15,
  experiences: 15,
  documents: 15,
  goals: 15,
};

function computeCompletion(profile) {
  let score = 0;

  if (profile.personalInfo && Object.keys(profile.personalInfo).length > 0) {
    score += WEIGHTS.personalInfo;
  }
  if (profile.education && profile.education.length > 0) score += WEIGHTS.education;
  if (profile.skills && profile.skills.length > 0) score += WEIGHTS.skills;
  if (profile.experiences && profile.experiences.length > 0) score += WEIGHTS.experiences;
  if (profile.documents && profile.documents.length > 0) score += WEIGHTS.documents;
  if (profile.goals && profile.goals.lifeIn10Years) score += WEIGHTS.goals;

  return Math.min(100, score);
}

module.exports = { computeCompletion };
