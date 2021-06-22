class ExperienceRatings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost = () => {
    this.zoo.roomRouteEndpoint("/submit_experience_rating", async (req, res, params) => {
      const submittedAt = new Date()
      const feedback = req.body.feedback || null

      const rating = await shared.db.experienceRatings.createRating(
        req.actor.id,
        req.room.id,
        params.rating,
        submittedAt,
        feedback
      )

      lib.feedback.notify(rating, req.actor, false)

      return api.http.succeed(req, res, { ratingId: rating.id, rating: rating.rating, feedback: rating.feedback })
    }, ["rating"])

    this.zoo.loggedInPostEndpoint("/update_experience_rating", async (req, res, params) => {
      const rating = await shared.db.experienceRatings.getRating(params.rating_id)

      if (!rating) {
        return api.http.fail(req, res, {
          message: "Rating does not exist",
          errorCode: shared.error.code.NOT_FOUND,
        }, shared.api.http.code.NOT_FOUND)
      }

      if (rating.actor_id !== req.actor.id) {
        return api.http.fail(req, res, {
          message: "You can't update that rating",
          errorCode: shared.error.code.UNAUTHORIZED,
        }, shared.api.http.code.UNAUTHORIZED)
      }

      const updates = {}

      if (parseInt(req.body.rating)) {
        updates.rating = req.body.rating
      }
      if (req.body.feedback != null) {
        updates.feedback = req.body.feedback
      }

      const updated = await shared.db.experienceRatings.updateRating(rating.id, updates)

      lib.feedback.notify(updated, req.actor, true)

      return api.http.succeed(req, res, { ratingId: updated.id, rating: updated.rating, feedback: updated.feedback })
    }, ["rating_id"])
  }
}

module.exports = ExperienceRatings
