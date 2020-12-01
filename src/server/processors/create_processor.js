const Processor = require("./processor")

class CreateProcessor extends Processor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "room/addWidget":
        return this.createWidget(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.data.kind}`
        )
    }
  }

  async createWidget(event, participants) {
    const room = event._sender.room
    const widgetOwner = event._sender.user
    const payload = event.data.payload

    if(!room) {
      return event._sender.sendError(event, lib.ErrorCodes.ROOM_NOT_FOUND, `Invalid room_id ${event.roomId}`)
    }
    if(!widgetOwner) {
      return event._sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, `Must authenticate to create widgets.`)
    }
    if(!payload || !payload.type) {
      return event._sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widget type in payload.`)
    }
    if(!payload.widgetState || !payload.roomState) {
      return event._sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widgetState and roomState in payload.`)
    }
    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: widgetOwner.id, _type: payload.type})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return widget
    })
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
    await lib.roomData.addWidget(widget.id, room.id, payload.widgetState, payload.roomState)
    participants.broadcastFrom(event._sender, event._message)
    return event._sender.sendResponse(event, { widgetId: widget.id, success: true })
  }
}

module.exports = CreateProcessor
