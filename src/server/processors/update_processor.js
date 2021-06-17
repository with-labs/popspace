class UpdateProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "transformWidget":
        return this.updateWidgetRoomState(hermesEvent)
      case "updateWidget":
        return this.updateWidgetState(hermesEvent)
      case "transformSelf":
        return this.updateRoomParticipantState(hermesEvent)
      case "updateSelf":
        return this.updateParticipantState(hermesEvent)
      case "updateRoomState":
        return this.updateRoomState(hermesEvent)
      default:
        return hermesEvent.senderParticipant().sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
        )
    }
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload()
    const result = await shared.db.room.data.updateRoomWidgetState(event.roomId(), widget.widget_id, widget.transform)
    sender.respondAndBroadcast(event, "widgetTransformed")
  }

  async updateWidgetState(event) {
    const widget = event.payload()
    const result = await shared.db.room.data.updateWidgetState(widget.widget_id, widget.widget_state)
    sender.respondAndBroadcast(event, "widgetUpdated")
  }

  async updateRoomParticipantState(event) {
    const sender = event.senderParticipant()
    return sender.updateTransform(event.payload().transform, event)
  }

  async updateParticipantState(event) {
    const sender = event.senderParticipant()
    return sender.updateState(event.payload().participant_state, event)
  }

  async updateRoomState(event) {
    const sender = event.senderParticipant()
    await shared.db.room.data.updateRoomState(event.roomId(), event.payload())
    sender.respondAndBroadcast(event, "roomStateUpdated")
  }
}

module.exports = UpdateProcessor
