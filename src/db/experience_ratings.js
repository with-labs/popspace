const prisma = require('./prisma');

/**
 * @typedef {Object} ExperienceRating
 * @property {number} rating
 * @property {string | null} feedback
 * @property {string} submittedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} id
 * @property {number} actorId
 * @property {number} roomId
 */

class ExperienceRatings {
  /**
   * Creates a new experience rating entry
   * @param {number} actorId
   * @param {number} roomId
   * @param {number} rating 1-5
   * @param {Date} submittedAt
   * @param {string | null} feedback
   * @returns {Promise<ExperienceRating>}
   */
  async createRating(actorId, roomId, rating, submittedAt, feedback) {
    return prisma.experienceRating.create({
      data: {
        actorId,
        roomId,
        submittedAt: submittedAt.toUTCString(),
        rating,
        feedback,
      },
    });
  }

  /**
   *
   * @param {number} ratingId
   * @param {Object} updates
   * @param {number | undefined} updates.rating
   * @param {string | undefined} updates.feedback
   * @returns {Promise<ExperienceRating>}
   */
  async updateRating(ratingId, updates) {
    return prisma.experienceRating.update({
      where: { ratingId },
      data: updates,
    });
  }

  /**
   * Gets a single rating by ID
   * @param {number} ratingId
   * @returns {Promise<ExperienceRating | null>}
   */
  async getRating(ratingId) {
    return prisma.experienceRating.findUnique({
      where: {
        id: ratingId,
      },
    });
  }
}

module.exports = new ExperienceRatings();
