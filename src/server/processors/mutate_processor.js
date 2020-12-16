class MutateProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "moveWidget":
        return this.moveWidget(mercuryEvent)
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

  async moveWidget(event) {
    const widget = event.payload()
    const sender = event.senderParticipant()
    let x, y
    try {
      x = parseInt(widget.room_state.position.x)
      y = parseInt(widget.room_state.position.y)
    } catch {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Invalid x,y for moveWidget.`)
    }
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), {
      x: x,
      y: y
    })
    // TODO: handle errors
    this.sendToPeersAndSelf(event)
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), widget.room_state)
    // TODO: handle errors
    this.sendToPeersAndSelf(event)
  }

  async updateWidgetState(event) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetState(widget.widget_id, event.roomId(), widget.widget_state)
    // TODO: handle errors
    this.sendToPeersAndSelf(event)
  }

  sendToPeersAndSelf(event) {
    const sender = event.senderParticipant()
    sender.broadcastPeerEvent(event.kind(), event.payload())
    // We could save traffic here and only send the fact that the event was applied
    sender.sendResponse(event, event.payload(), event.kind())
  }

  async updateRoomState(event) {

  }
}

module.exports = MutateProcessor
