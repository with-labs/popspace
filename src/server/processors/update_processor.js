class UpdateProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "transformWidget":
        return this.updateWidgetRoomState(mercuryEvent)
      case "updateWidget":
        return this.updateWidgetState(mercuryEvent)
      case "transformSelf":
        return this.updateRoomParticipantState(mercuryEvent)
      case "updateSelf":
        return this.updateParticipantState(mercuryEvent)
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

  async updateRoomParticipantState(event, responseKind) {
    await lib.roomData.updateRoomParticipantState(event.roomId(), event.senderParticipant(), event.payload().transform)
    this.sendToPeersAndSelf(event, "participantTransformed")
  }

  async updateParticipantState(event) {
    await lib.roomData.updateParticipantState(event.senderParticipant(), event.payload().participant_state)
    this.sendToPeersAndSelf(event, "participantUpdated")
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload()
    const result = await lib.roomData.updateWidgetRoomState(event.roomId(), widget.widget_id, widget.transform)
    // TODO: handle errors
    this.sendToPeersAndSelf(event, "widgetTransformed")
  }

  async updateWidgetState(event) {
    const widget = event.payload()
    const result = await lib.roomData.updateWidgetState(widget.widget_id, widget.widget_state)
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
