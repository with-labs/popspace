const Processor = require("./processor")

class CreateProcessor extends Processor {
  async process(event) {
    switch(event.kind) {
      case "room/addWidget":
        return this.createWidget(event)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.kind}`
        )
    }
  }

  async createWidget(event, participants) {
    const room = await shared.db.pg.massive.rooms.findOne({id: event.room_id})
    if(!room) {
      return event._sender.sendError(event, lib.ErrorCodes.ROOM_NOT_FOUND, `Invalid room_id ${event.room_id}`)
    }
    const owner = await shared.db.pg.massive.users.findOne({id: event.sender_id})
    if(!owner) {
      return event._sender.sendError(event, lib.ErrorCodes.USER_NOT_FOUND, `User not found ${event.sender_id}`)
    }
    await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: event.sender_id})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: room.id})
      return widget // so clients can reference the widget id
    })

    participants.broadcastFrom(event._sender, event.message)
    event._sender.sendResponse(event, { success: true })
  }
}

module.exports = CreateProcessor
