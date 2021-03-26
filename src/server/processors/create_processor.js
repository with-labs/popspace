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

    const { widget, roomWidget } = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: widgetOwner.id, _type: payload.type})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return { widget, roomWidget }
    })
    /**
      TODO: ensure that if the server dies here, the data is not lost
      https://with.height.app/mercury/T-765
    */
    try {
      const roomWidget = new shared.models.RoomWidget(room.id, widget, payload.widget_state, payload.transform, widgetOwner.display_name)
      await shared.db.room.widgets.addWidgetInRoom(roomWidget)
      sender.sendResponse(event, roomWidget.serialize(), "widgetCreated")
      sender.broadcastPeerEvent("widgetCreated", roomWidget.serialize())
    } catch (e) {
      const widgetId = widget.id
      log.error.error(`Could not write widget (rid ${room.id}, uid ${widgetOwner.id}, wid ${widget.id}, ${JSON.stringify(payload)})`)
      await shared.db.pg.massive.withTransaction(async (tx) => {
        await tx.widgets.destroy({id: widget.id})
        await tx.room_widgets.destroy({widget_id: widget.id, room_id: room.id})
        return { widget, roomWidget }
      })
      if(e.code == 'ProvisionedThroughputExceededException') {
        log.error.error(`Dynamo throughput excededed (rid ${room.id}, wid ${widgetId})`)
        return sender.sendError(event, shared.error.code.RATE_LIMIT_EXCEEDED, `Widget database write capacity temporarily exceeded, please retry`)
      } else {
        log.error.error(`Unexpected error writing widget (rid ${room.id}, wid ${widgetId})`)
        return sender.sendError(event, shared.error.code.UNEXPECTER_ERROR, `Could not write widget to database, please try again later.`)
      }
    }
  }
}

module.exports = CreateProcessor
