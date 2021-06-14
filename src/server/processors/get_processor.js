class GetProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "getRoom":
        return await this.respondRoomData(hermesEvent)
      case "getWidget":
        return await this.respondWidgetData(hermesEvent)
      default:
        return hermesEvent.senderParticipant().sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
        )
    }
  }

  async respondRoomData(event) {
    const participant = event.senderParticipant()
    const room = participant.getRoom()
    const roomData = new shared.models.RoomData(room)

    return await event.senderParticipant().sendResponse(event, roomData)
  }

  async respondWidgetData(event) {
    const roomWidget = await shared.models.RoomWidget.fromWidgetId(event.payload().widget_id, event.roomId())
    return await event.senderParticipant().sendResponse(event, roomWidget.serialize())
  }

}

module.exports = GetProcessor
