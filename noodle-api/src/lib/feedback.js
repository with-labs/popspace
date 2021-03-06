const axios = require("axios")

/**
 * Manages the notification of the team for incoming user
 * feedback collected on this server
 */
class Feedback {
  /**
   *
   * @param {Object} data
   * @param {number} data.rating
   * @param {string} data.feedback
   * @param {Object} actor
   * @param {Object} actor.id
   * @param {string} actor.displayName
   * @param {boolean} updated
   */
  notifyExperienceRating = async (data, actor, updated) => {
    if (!process.env.SLACK_FEEDBACK_WEBHOOK_URL) {
      lib.log.error.warn("No Slack feedback webhook URL provided, cannot notify!")
      return
    }

    try {
      await axios.post(process.env.SLACK_FEEDBACK_WEBHOOK_URL, {
        text: `actor *${this.formatUser(actor)}* ${
          updated ? "updated their" : "submitted new"
        } feedback:\n_Rating:_ ${this.formatStars(data.rating)}\n_Feedback:_ ${data.feedback ?? "None"}`,
      })
    } catch (err) {
      lib.log.error.error(err)
    }
  }

  notifySurveyResponse = async (data, actor) => {
    if (!process.env.SLACK_SURVEY_WEBHOOK_URL) {
      lib.log.error.warn("No Slack survey webhook URL provided, cannot notify!")
      return
    }

    try {
      await axios.post(process.env.SLACK_SURVEY_WEBHOOK_URL, {
        text: `actor *${this.formatUser(actor)}* submitted a new survey response to survey _${data.surveyName}_:\n${data.response}`,
      })
    } catch (err) {
      lib.log.error.error(err)
    }
  }

  /**
   *
   * @param {Object} actor
   * @param {string} actor.id
   * @param {string} actor.displayName
   */
  formatUser = (actor) => {
    return `${actor.displayName || 'Anonymous'} (id: ${actor.id})`
  }

  formatStars = (num) => {
    // rating is 0-based
    return new Array(num + 1).fill("⭐️").join("")
  }
}

module.exports = new Feedback()
