class ExperienceRatings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost = () => {
    this.zoo.loggedInPostEndpoint("/submit_experience_rating", async (req, res) => {
      if (!req.body.room_route) {
        return http.fail(req, res, "Room route must be provided", {
          errorCode: shared.error.code.INVALID_API_PARAMS,
        })
      } else if (!req.body.rating && req.body.rating !== 0) {
        return http.fail(req, res, "Rating must be provided", {
          errorCode: shared.error.code.INVALID_API_PARAMS,
        })
      }
      const submittedAt = new Date()
      const feedback = req.body.feedback || null

      const room = await shared.db.rooms.roomByRoute(req.body.room_route)

      if (!room) {
        return http.fail(req, res, "Provided room not found", { errorCode: shared.error.code.UNKNOWN_ROOM })
      }

      const rating = await shared.db.experienceRatings.createRating(
        req.user.id,
        room.id,
        req.body.rating,
        submittedAt,
        feedback
      )

      lib.feedback.notify(rating, req.user, false)

      return http.succeed(req, res, { ratingId: rating.id, rating: rating.rating, feedback: rating.feedback })
    })

    this.zoo.loggedInPostEndpoint("/update_experience_rating", async (req, res) => {
      if (!req.body.rating_id) {
        return http.fail(req, res, "Rating ID must be provided", {
          errorCode: shared.error.code.INVALID_API_PARAMS,
        })
      }

      const rating = await shared.db.experienceRatings.getRating(req.body.rating_id)

      if (!rating) {
        return http.fail(req, res, "Rating does not exist", {
          errorCode: shared.error.code.NOT_FOUND,
        })
      }

      if (rating.user_id !== req.user.id) {
        return http.fail(req, res, "You can't update that rating", {
          errorCode: shared.error.code.UNAUTHORIZED,
        })
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

      lib.feedback.notify(updated, req.user, true)

      return http.succeed(req, res, { ratingId: updated.id, rating: updated.rating, feedback: updated.feedback })
    })
  }
}
