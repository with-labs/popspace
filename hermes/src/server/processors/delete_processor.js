class DeleteProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "deleteWidget":
        return this.deleteWidget(hermesEvent)
      case "leave":
        return this.removeParticipant(hermesEvent)
      default:
        return hermesEvent.senderParticipant().sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
        )
    }
  }

  async deleteWidget(event) {
    const sender = event.senderParticipant()
    await shared.db.room.data.softDeleteWidget(parseInt(event.payload().widgetId), parseInt(sender.actorId()))
    sender.broadcastPeerEvent("widgetDeleted", event.payload())
    sender.sendResponse(event, event.payload(), "widgetDeleted")
  }

  async removeParticipant(event) {
    return event.participant.disconnect()
  }
}

module.exports = DeleteProcessor
