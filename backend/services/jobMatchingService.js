/**
 * Job Matching Service
 * Calculates how well a user's skills match a job's required skills
 */

/**
 * Normalize skill string for comparison (lowercase, trim)
 */
const normalizeSkill = (skill) => skill.toLowerCase().trim();

/**
 * Calculate match percentage between user skills and job required skills
 * @param {string[]} userSkills - Array of user's skills
 * @param {string[]} jobSkills - Array of job's required skills
 * @returns {number} Match percentage (0-100)
 */
const calculateMatchPercentage = (userSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;

  const normalizedUserSkills = userSkills.map(normalizeSkill);
  const normalizedJobSkills = jobSkills.map(normalizeSkill);

  const matchedSkills = normalizedJobSkills.filter((skill) =>
    normalizedUserSkills.some(
      (userSkill) => userSkill.includes(skill) || skill.includes(userSkill)
    )
  );

  return Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
};

/**
 * Sort jobs by match percentage (highest first)
 * @param {Array} jobs - Array of job objects
 * @param {string[]} userSkills - User's skills
 * @returns {Array} Jobs sorted by match percentage with matchPercentage field added
 */
const sortJobsByMatch = (jobs, userSkills = []) => {
  return jobs
    .map((job) => ({
      ...job,
      matchPercentage: calculateMatchPercentage(userSkills, job.skills_required),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

module.exports = { calculateMatchPercentage, sortJobsByMatch };
