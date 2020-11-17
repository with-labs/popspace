class MessageProcessor {
  constructor(participants) {
    this.participants = participants
    this.participants.setMessageHandler((participant, message) => {
      try {
        log.dev.debug(`Got message from ${participant.id} ${message}`)
        const event = JSON.parse(message)
        this.process(participant, event)
      } catch(e) {
        // participant.sendError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid JSON")
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
