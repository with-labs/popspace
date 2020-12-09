class GetProcessor {
  async process(mercuryEvent, participants) {
    switch(mercuryEvent.kind()) {
      case "echo":
        return await this.sendEcho(mercuryEvent, participants)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async sendEcho(event, participants) {
    participants.broadcastEventFrom(event.senderParticipant(), event.sourceEvent())
    event.senderParticipant().sendResponse(event, { received: true })
  }
}

module.exports = GetProcessor
