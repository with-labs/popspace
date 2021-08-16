class CreateProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "createWidget":
        return this.createWidget(hermesEvent)
      case "createChatMessage":
        return this.createMessage(hermesEvent)
      default:
        return hermesEvent._sender.sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
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
    if(!payload.widgetState || !payload.transform) {
      return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must provide widgetState and transform in payload.`)
    }

    const roomWidget = await shared.db.room.data.addWidgetInRoom(widgetCreator.id, room.id, payload.type, payload.widgetState, payload.transform)
    const result = await roomWidget.serialize()
    sender.sendResponse(event, result, "widgetCreated")
    sender.broadcastPeerEvent("widgetCreated", result)
  }

  async createMessage(hermesEvent) {
    const sender = hermesEvent.senderParticipant()
    const payload = hermesEvent.payload()

    const result = await shared.db.prisma.message.create({
      data: {
        chatId: payload.widget_id,
        content: payload.content,
        senderId: sender.actorId()
      }
    })
    const { widgetId, ...messageInfo } = payload;

    sender.respondAndBroadcast(hermesEvent, "chatMessageCreated", {
      widget_id: payload.widget_id,
      message: {
        ...messageInfo,
        senderId: result.senderId,
        senderDisplayName: sender.actor.displayName,
        createdAt: result.createdAt
      }
    })
  }
}

module.exports = CreateProcessor
