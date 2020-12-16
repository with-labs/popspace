class UpdateProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "transformWidget":
        return this.updateWidgetRoomState(mercuryEvent)
      case "updateWidget":
        return this.updateWidgetState(mercuryEvent)
      case "transformSelf":
        return this.updateParticipantRoomState(mercuryEvent, "participantTransformed")
      case "updateSelf":
        return this.updateParticipantRoomState(mercuryEvent, "participantUpdated")
      case "updateRoomState":
        return this.updateRoomState(mercuryEvent)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async updateParticipantRoomState(event, responseKind) {
    await lib.roomData.dynamo.setParticipantState(event.roomId(), event.userId(), event.payload().room_state)
    this.sendToPeersAndSelf(event, responseKind)
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload()
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), widget.room_state)
    // TODO: handle errors
    this.sendToPeersAndSelf(event, "widgetTransformed")
  }

  async updateWidgetState(event) {
    const widget = event.payload()
    const result = await lib.roomData.updateWidgetState(widget.widget_id, event.roomId(), widget.widget_state)
    // TODO: handle errors
    this.sendToPeersAndSelf(event, "widgetUpdated")
  }

  async updateRoomState(event) {
    await lib.roomData.dynamo.setRoomState(event.roomId(), event.payload())
    this.sendToPeersAndSelf(event, "roomStateUpdated")
  }


  sendToPeersAndSelf(event, kind) {
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent(kind, event.payload())
    sender.sendResponse(event, event.payload(), kind)
  }

}

module.exports = UpdateProcessor
