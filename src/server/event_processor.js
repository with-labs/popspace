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
  "auth": "auth",
  "ping": "passthrough",
  "echo": "passthrough",
  "passthrough": "passthrough",
  "updateMicState": "analytics",
  "updateVideoState": "analytics",
  "updateSelfActor": "update"
}

const PUBLIC_EVENT_KINDS = {
  "auth": true,
  "ping": true
}

const processors = {
  auth: new _processors.AuthProcessor(),
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
