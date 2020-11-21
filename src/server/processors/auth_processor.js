const Processor = require("./processor")

class AuthProcessor extends Processor {
  async process(event) {
    switch(event.data.kind) {
      case "auth":
        return this.authenticate(event)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.kind}`
        )
    }
  }

  async authenticate(event) {
    const success = await event._sender.authenticate(event.data.payload.token, event.data.payload.roomId)
    event._sender.sendResponse(event, {
      kind: "auth",
      success: "true"
    })
  }
}

module.exports = AuthProcessor
