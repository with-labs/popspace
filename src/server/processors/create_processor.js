class CreateProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "createWidget":
        return this.createWidget(mercuryEvent)
      default:
        return mercuryEvent._sender.sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvents.kind()}`
        )
    }
  }

  async createWidget(event) {
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
    if(!payload.widget_state || !payload.transform) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widgetState and transform in payload.`)
    }

    // TODO: Perhaps-in-room and widgets should have their own classes,
    // similar to participants: the database access logic (fetch/update)
    // and serialization logic can live there.
    // Arguably that may be more useful if we want to cache widget data later,
    // and we don't need it yet.
    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: widgetOwner.id, _type: payload.type})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return widget
    })

    const roomWidget = new lib.dto.RoomWidget(room.id, widget, payload.widget_state, payload.transform)
    await lib.roomData.addWidgetInRoom(roomWidget)

    sender.sendResponse(event, roomWidget.serialize(), "widgetCreated")
    sender.broadcastPeerEvent("widgetCreated", roomWidget.serialize())
  }
}

module.exports = CreateProcessor
