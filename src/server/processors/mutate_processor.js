class MutateProcessor {
  async process(mercuryEvent, participants) {
    switch(mercuryEvent.kind()) {
      case "room/moveObject":
        return this.moveObject(mercuryEvent, participants)
      case "room/state":
        return this.updateRoomState(mercuryEvent, participants)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async moveObject(event, participants) {
    const widget = event.payload()
    const sender = event.senderParticipant()
    try {
      const x = parseInt(widget.roomState.position.x), y = parseInt(widget.roomState.position.y)
    } catch {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Invalid x,y for moveObject.`)
    }
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), widget.roomState)
    // TODO: handle errors
    this.sendToPeersAndSelf(event)
  }

  async updateWidgetRoomState(event, participants) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), widget.roomState)
    this.sendToPeersAndSelf(event)
  }

  async updateWidgetState(event, participants) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetState(widget.widget_id, event.roomId(), widget.widgetState)
    this.sendToPeersAndSelf(event)
  }

  sendToPeersAndSelf(event) {
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent(event.kind(), event.payload())
    // We could save traffic here and only send the fact that the event was applied
    sender.sendResponse(event, event.payload(), event.kind())
  }
}

module.exports = MutateProcessor
