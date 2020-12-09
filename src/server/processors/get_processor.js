class GetProcessor {
  async process(mercuryEvent, participants) {
    switch(mercuryEvent.kind()) {
      case "room/getRoom":
        return await this.respondRoomData(mercuryEvent, participants)
      case "room/getWidget":
        return await this.respondWidgetData(mercuryEvent, participants)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async respondRoomData(event, participants) {
    const roomData = await lib.roomData.getRoomData(event.roomId())
    return await event.senderParticipant().sendResponse(event, roomData)
  }

  async respondWidgetData(event, participants) {
    const roomWidget = await lib.dto.RoomWidget.fromWidgetId(event.payload().widget_id, event.roomId())
    return await event.senderParticipant().sendResponse(event, roomWidget.serialize())
  }
}

module.exports = GetProcessor
