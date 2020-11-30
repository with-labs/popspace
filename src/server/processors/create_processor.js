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

    if(!room) {
      return event._sender.sendError(event, lib.ErrorCodes.ROOM_NOT_FOUND, `Invalid room_id ${event.roomId}`)
    }
    if(!widgetOwner) {
      return event._sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, `Must authenticate to create widgets.`)
    }
    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: widgetOwner.id})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return widget // so clients can reference the widget id
    })

    participants.broadcastFrom(event._sender, event._message)
    event._sender.sendResponse(event, { widgetId: widget.id, success: true })
  }
}

module.exports = CreateProcessor
