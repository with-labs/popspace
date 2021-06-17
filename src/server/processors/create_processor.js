class CreateProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "createWidget":
        return this.createWidget(hermesEvent)
      default:
        return hermesEvent._sender.sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvents.kind()}`
        )
    }
  }

  async createWidget(event) {
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
    const payload = event.payload()
    const sender = event.senderParticipant()
    const room = event.room()
    const widgetCreator = event.senderActor()

    if(!widgetCreator) {
      return sender.sendError(event, shared.error.code.UNAUTHORIZED_USER, `Must authenticate to create widgets.`)
    }
    if(!payload.type) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widget type in payload.`)
    }
    if(!payload.widget_state || !payload.transform) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widgetState and transform in payload.`)
    }

    const roomWidget = await shared.db.room.data.addWidgetInRoom(widgetCreator.id, room.id, payload.type, payload.widgetState, payload.transform)
    sender.sendResponse(event, roomWidget.serialize(), "widgetCreated")
    sender.broadcastPeerEvent("widgetCreated", roomWidget.serialize())
  }
}

module.exports = CreateProcessor
