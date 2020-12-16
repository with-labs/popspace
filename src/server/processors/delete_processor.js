class DeleteProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "deleteWidget":
        return this.deleteWidget(mercuryEvent)
      case "leave":
        return this.removeParticipant(mercuryEvent)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async deleteWidget(event) {
    await lib.roomData.softDeleteWidget(event.payload().event_id)
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent("widgetDeleted", event.payload())
    sender.sendResponse(event, event.payload(), "widgetDeleted")
  }

  async removeParticipant(event) {
    return event.participant.disconnect()
  }

}

module.exports = DeleteProcessor
