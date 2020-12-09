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
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent(event.kind(), event.payload())
    sender.sendResponse(event, { received: true })
  }
}

module.exports = GetProcessor
