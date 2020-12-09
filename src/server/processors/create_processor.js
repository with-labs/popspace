class CreateProcessor {
  async process(mercuryEvent, participants) {
    switch(mercuryEvent.kind()) {
      case "room/addWidget":
        return this.createWidget(mercuryEvent, participants)
      default:
        return mercuryEvent._sender.sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvents.kind()}`
        )
    }
  }

  async createWidget(event, participants) {
    /*
      payload example:
      {
        type: "sticky_note",
        roomState: {
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100},
        },
        widgetState: {
          text: "Hello world!"
        }
      }
    */
    const payload = event.payload()
    const sender = event.senderParticipant()
    const room = event.room()
    const widgetOwner = event.senderUser()

    if(!widgetOwner) {
      return sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, `Must authenticate to create widgets.`)
    }
    if(!payload.type) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widget type in payload.`)
    }
    if(!payload.widgetState || !payload.roomState) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widgetState and roomState in payload.`)
    }

    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: widgetOwner.id, _type: payload.type})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return widget
    })

    const roomWidget = new lib.dto.RoomWidget(room.id, widget, payload.widgetState, payload.roomState)
    await lib.roomData.addWidgetInRoom(roomWidget)

    const responseEvent = new lib.event.ResponseEvent(event, roomWidget.serialize(), "room/addWidget")
    // TODO: we may want a cleaner broadcast system where only the sender gets his requestId back
    return participants.broadcastEvent(sender, responseEvent)
  }
}

module.exports = CreateProcessor
