const ErrorCodes = require("./error_codes")

class MessageProcessor {
  constructor(participants) {
    this.participants = participants
    this.participants.setMessageHandler((participant, message) => {
      try {
        const event = JSON.parse(message)
        this.process(participant, event)
      } catch(e) {
        // participant.sendError(ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid JSON")
        this.participants.broadcastFrom(participant, message)
      } finally {

      }
    })
  }

  process(participant, event) {
    this.participants.broadcastFrom(participant, event)
  }



}

module.exports = MessageProcessor
