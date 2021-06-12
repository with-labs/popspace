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

  async updateRoomParticipantState(event, responseKind) {
    const sender = event.senderParticipant()
    const newRoomState = await lib.roomData.updateRoomParticipantState(event.roomId(), sender, event.payload().transform)
    sender.updateTransform(newRoomState)
    this.sendToPeersAndSelf(event, "participantTransformed")
  }

  async updateParticipantState(event) {
    const sender = event.senderParticipant()
    const newState = await lib.roomData.updateParticipantState(sender, event.payload().participant_state)
    sender.updateState(newState)
    this.sendToPeersAndSelf(event, "participantUpdated")
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload()
    const result = await shared.db.room.widgets.updateWidgetRoomState(event.roomId(), widget.widget_id, widget.transform)
    // TODO: handle errors
    this.sendToPeersAndSelf(event, "widgetTransformed")
  }

  async updateWidgetState(event) {
    const widget = event.payload()
    const result = await shared.db.room.widgets.updateWidgetState(widget.widget_id, widget.widget_state)
    // TODO: handle errors
    this.sendToPeersAndSelf(event, "widgetUpdated")
  }

  async updateRoomState(event) {
    await shared.db.dynamo.room.setRoomState(event.roomId(), event.payload())
    this.sendToPeersAndSelf(event, "roomStateUpdated")
  }

  sendToPeersAndSelf(event, kind) {
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent(kind, event.payload())
    sender.sendResponse(event, event.payload(), kind)
  }
}

module.exports = UpdateProcessor
