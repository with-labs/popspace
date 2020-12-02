const Processor = require("./processor")

class GetProcessor extends Processor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "room/get":
        return await this.respondRoomData(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.data.kind}`
        )
    }
  }

  async respondRoomData(event, participants) {
    const roomData = await lib.roomData.getRoomData(event._sender.room.id)
    return await event._sender.sendResponse(event, { success: true, data: roomData })
  }
}

module.exports = GetProcessor
