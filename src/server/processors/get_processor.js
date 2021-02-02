class GetProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "getRoom":
        return await this.respondRoomData(mercuryEvent)
      case "getWidget":
        return await this.respondWidgetData(mercuryEvent)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async respondRoomData(event) {
    const roomData = await lib.roomData.getRoomData(event.roomId())
    return await event.senderParticipant().sendResponse(event, roomData)
  }

  async respondWidgetData(event) {
    const roomWidget = await shared.models.RoomWidget.fromWidgetId(event.payload().widget_id, event.roomId())
    return await event.senderParticipant().sendResponse(event, roomWidget.serialize())
  }

}

module.exports = GetProcessor
