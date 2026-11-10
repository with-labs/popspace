const _processors = require("./processors/_processors")

const ACTION_BY_EVENT_KIND = {
  "createWidget": "create",
  "transformWidget": "update",
  "updateWidget": "update",
  "transformSelf": "update",
  "updateSelf": "update",
  "updateRoomState": "update",
  "leave": "delete",
  "deleteWidget": "delete",
  "getRoom": "get",
  "getWidget": "get",
  "auth": "connection",
  "setObserver": "connection",
  "ping": "passthrough",
  "echo": "passthrough",
  "passthrough": "passthrough",
  "updateMicState": "analytics",
  "updateVideoState": "analytics",
  "updateSelfActor": "update",
  "updateSelfDisplayName": "update",
  "updateSelfAvatarName": "update",
  "updateWallpaper": "update",
  "undoLastWidgetDelete": "update",
  "createChatMessage": "create",
  "getMoreChatMessages": "get"
}

const PUBLIC_EVENT_KINDS = {
  "auth": true,
  "ping": true
}

/*
  Events that act on an existing widget, and the payload field holding its id.
  Widget ids are global and sequential, so without this check anyone in one
  room could read or change widgets and chats of any other room.
*/
const WIDGET_ID_FIELD_BY_EVENT_KIND = {
  "getWidget": "widgetId",
  "transformWidget": "widgetId",
  "updateWidget": "widgetId",
  "deleteWidget": "widgetId",
  "createChatMessage": "widgetId",
  "getMoreChatMessages": "widgetId"
}

const isWidgetInSenderRoom = async (hermesEvent, idField) => {
  const payload = hermesEvent.payload() || {}
  const widgetId = Number(payload[idField])
  if (!Number.isSafeInteger(widgetId)) {
    return false
  }
  const roomWidget = await shared.db.prisma.roomWidget.findUnique({ where: { widgetId } })
  return !!roomWidget && roomWidget.roomId === hermesEvent.roomId()
}

const processors = {
  connection: new _processors.ConnectionProcessor(),
  create: new _processors.CreateProcessor(),
  update: new _processors.UpdateProcessor(),
  get: new _processors.GetProcessor(),
  passthrough: new _processors.PassthroughProcessor(),
  delete: new _processors.DeleteProcessor(),
  analytics: new _processors.AnalyticsProcessor()
}

class EventProcessor {
  constructor(participants) {
    this.participants = participants
    this.participants.setEventHandler(async (hermesEvent) => {
      const eventKind = hermesEvent.kind()
      const action = ACTION_BY_EVENT_KIND[eventKind]
      const sender = hermesEvent.senderParticipant()
      if(!processors[action]) {
        return sender.sendError(hermesEvent, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Unrecognized event ${hermesEvent.kind()}.`)
      }
      if(!PUBLIC_EVENT_KINDS[eventKind]) {
        if(!sender.isAuthenticated()) {
          return sender.sendError(hermesEvent, shared.error.code.UNAUTHORIZED_USER, "Please authenticate.")
        }
        const hasAuthorizedRoomAccess = await sender.hasAuthorizedRoomAccess()
        if(!hasAuthorizedRoomAccess) {
          /* This can happen if an actor was kicked */
          return sender.sendError(hermesEvent, shared.error.code.UNAUTHORIZED_USER, "Lost authorization")
        }
        const idField = WIDGET_ID_FIELD_BY_EVENT_KIND[eventKind]
        if(idField && !(await isWidgetInSenderRoom(hermesEvent, idField))) {
          // same response whether the widget is missing or in another room
          return sender.sendError(hermesEvent, lib.ErrorCodes.WIDGET_NOT_FOUND, "No such widget in this room")
        }
      }
      try {
        return await processors[action].process(hermesEvent, this.participants)
      } catch(e) {
        log.app.error(`Error processing ${action}: ${e ? e.message || e : 'null error'}\n${e ? e.stack : ''}`)
        return sender.sendError(hermesEvent, lib.ErrorCodes.UNEXPECTED_ERROR, "Something went wrong.", {message: e.message, stack: e.stack})
      }
    })
  }
}

module.exports = EventProcessor
