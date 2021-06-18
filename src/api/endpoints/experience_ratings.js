class ExperienceRatings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost = () => {
    this.zoo.loggedInPostEndpoint("/submit_experience_rating", async (req, res) => {
      if (!req.body.room_route) {
        return api.http.fail(req, res, {
          message:  "Room route must be provided",
          errorCode: shared.error.code.INVALID_API_PARAMS,
        })
      } else if (!req.body.rating && req.body.rating !== 0) {
        return api.http.fail(req, res, {
          message: "Rating must be provided",
          errorCode: shared.error.code.INVALID_API_PARAMS,
        })
      }
      const submittedAt = new Date()
      const feedback = req.body.feedback || null

      const room = await shared.db.room.core.roomByRoute(req.body.room_route)

      if (!room) {
        return api.http.fail(req, res, {
          message: "Provided room not found",
          errorCode: shared.error.code.UNKNOWN_ROOM,
        }, shared.http.code.NOT_FOUND)
      }

      const rating = await shared.db.experienceRatings.createRating(
        req.actor.id,
        room.id,
        req.body.rating,
        submittedAt,
        feedback
      )

      lib.feedback.notify(rating, req.actor, false)

      return api.http.succeed(req, res, { ratingId: rating.id, rating: rating.rating, feedback: rating.feedback })
    })

    this.zoo.loggedInPostEndpoint("/update_experience_rating", async (req, res) => {
      if (!req.body.rating_id) {
        return api.http.fail(req, res, {
          message: "Rating ID must be provided",
          errorCode: shared.error.code.INVALID_API_PARAMS,
        });
      }

      const rating = await shared.db.experienceRatings.getRating(req.body.rating_id)

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
      // account for zero falsiness
      if (!!req.body.rating || req.body.rating === 0) {
        updates.rating = req.body.rating
      }
      if (!!req.body.feedback) {
        updates.feedback = req.body.feedback
      }

      const updated = await shared.db.experienceRatings.updateRating(rating.id, updates)

      lib.feedback.notify(updated, req.actor, true)

      return api.http.succeed(req, res, { ratingId: updated.id, rating: updated.rating, feedback: updated.feedback })
    })
  }
}

module.exports = ExperienceRatings
