class GetProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "getRoom":
        return await this.respondRoomData(hermesEvent)
      case "getWidget":
        return await this.respondWidgetData(hermesEvent)
      case "getMoreChatMessages": 
        return await this.respondChatWidgetData(hermesEvent)
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
    const response = await roomData.serialize()
    return await event.senderParticipant().sendResponse(event, response)
  }

  async respondWidgetData(event) {
    const roomWidget = await shared.models.RoomWidget.fromWidgetId(event.payload().widgetId, event.roomId())
    const result = await roomWidget.serialize()
    return await event.senderParticipant().sendResponse(event, result)
  }

  async respondChatWidgetData(event) {
    const sender = event.senderParticipant()
    const payload = event.payload()

    // widgetId was checked against the sender's room in the event processor
    const widgetId = Number(payload.widgetId)
    const lastMessageId = payload.lastMessageId ? Number(payload.lastMessageId) : null
    const messages = await shared.db.messages.getNextPageMessages(widgetId, lastMessageId);

    return await sender.sendResponse(event, {
      widget_id: widgetId,
      messages
    })
  }
}

module.exports = GetProcessor
