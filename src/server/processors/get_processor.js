class GetProcessor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "room/getRoom":
        return await this.respondRoomData(event, participants)
      case "room/getWidget":
        return await this.respondWidgetData(event, participants)
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
    return await event._sender.sendResponse(event, { success: true, payload: roomData })
  }

  async respondWidgetData(event, participants) {
    const roomWidget = await lib.dto.RoomWidget.fromWidgetId(event.data.payload.widget_id, event._sender.room.id)
    return await event._sender.sendResponse(event, { kind: "room/getWidget", payload: roomWidget.serialize() })
  }
}

module.exports = GetProcessor
