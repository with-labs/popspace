class DeleteProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "deleteWidget":
        return
      case "leave":
        return
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }


}

module.exports = DeleteProcessor
