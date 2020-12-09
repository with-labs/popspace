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
    participants.rebroadcast(event)
    sender.sendResponse(event, {kind: "room/moveObject", payload: widget})
  }

  async updateWidgetRoomState(event, participants) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event.roomId(), widget.roomState)
    participants.rebroadcast(event)
    event.senderParticipant().sendResponse(event, widget)
  }

  async updateWidgetState(event, participants) {
    const widget = event.payload().widget
    const result = await lib.roomData.updateWidgetState(widget.widget_id, event.roomId(), widget.widgetState)
    participants.rebroadcast(event)
    event.senderParticipant().sendResponse(event, widget)
  }
}

module.exports = MutateProcessor
