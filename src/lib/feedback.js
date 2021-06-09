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
   * @param {Object} user
   * @param {string} user.first_name
   * @param {string} user.last_name
   * @param {string} user.email
   * @param {boolean} updated
   */
  notify = async (data, user, updated) => {
    if (!process.env.SLACK_FEEDBACK_WEBHOOK_URL) {
      lib.log.default.warn("No Slack feedback webhook URL provided, cannot notify!")
      return
    }

    try {
      await axios.post(process.env.SLACK_FEEDBACK_WEBHOOK_URL, {
        text: `User *${this.formatUser(user)}* ${
          updated ? "updated their" : "submitted new"
        } feedback:\n_Rating:_ ${this.formatStars(data.rating)}\n_Feedback:_ ${data.feedback ?? "None"}`,
      })
    } catch (err) {
      lib.log.error.error(err)
    }
  }

  /**
   *
   * @param {Object} user
   * @param {string} user.first_name
   * @param {string} user.last_name
   * @param {string} user.email
   */
  formatUser = (user) => {
    return `${user.first_name} ${user.last_name} (${user.email})`
  }

  formatStars = (num) => {
    // rating is 0-based
    return new Array(num + 1).fill("⭐️").join("")
  }
}

module.exports = new Feedback()
