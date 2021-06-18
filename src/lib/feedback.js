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
   * @param {string} actor.display_name
   * @param {boolean} updated
   */
  notify = async (data, actor, updated) => {
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

  /**
   *
   * @param {Object} actor
   * @param {string} actor.id
   * @param {string} actor.display_name
   */
  formatUser = (actor) => {
    return `${actor.display_name || 'Anonymous'} (id: ${actor.id})`
  }

  formatStars = (num) => {
    // rating is 0-based
    return new Array(num + 1).fill("⭐️").join("")
  }
}

module.exports = new Feedback()
