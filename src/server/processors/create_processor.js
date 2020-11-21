const Processor = require("./processor")

class CreateProcessor extends Processor {
  async process(event, participants) {
    console.log("Processing create")
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
    const roomId = event.roomId
    const ownerId = event._sender.user.id

    const room = await shared.db.pg.massive.rooms.findOne({id: roomId})
    if(!room) {
      return event._sender.sendError(event, lib.ErrorCodes.ROOM_NOT_FOUND, `Invalid room_id ${event.roomId}`)
    }
    const owner = await shared.db.pg.massive.users.findOne({id: roomId})
    if(!owner) {
      return event._sender.sendError(event, lib.ErrorCodes.USER_NOT_FOUND, `User not found ${event.roomId}`)
    }
    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: ownerId})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: roomId})
      return widget // so clients can reference the widget id
    })

    participants.broadcastFrom(event._sender, event._message)
    event._sender.sendResponse(event, { widgetId: widget.id, success: true })
  }
}

module.exports = CreateProcessor
