class ExperienceRatings {
  /**
   * Creates a new experience rating entry
   * @param {number} userId
   * @param {number} roomId
   * @param {number} rating 1-5
   * @param {Date} submittedAt
   * @param {string | null} feedback
   */
  createRating(userId, roomId, rating, submittedAt, feedback) {
    return shared.db.pg.massive.experience_ratings.insert({
      user_id: userId,
      room_id: roomId,
      submitted_at: submittedAt.toUTCString(),
      rating,
      feedback
    })
  }

  /**
   *
   * @param {number} ratingId
   * @param {Object} updates
   * @param {number | undefined} updates.rating
   * @param {string | undefined} updates.feedback
   */
  updateRating(ratingId, updates) {
    return shared.db.pg.massive.experience_ratings.update(ratingId, updates)
  }

  getRating(ratingId) {
    return shared.db.pg.massive.experience_ratings.findOne({
      id: ratingId
    })
  }
}

module.exports = new ExperienceRatings()
