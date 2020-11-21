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
    if(success) {
      return event._sender.sendResponse(event, {
        kind: "auth",
        success: true
      })
    } else {
      return event._sender.sendError(
        event,
        lib.ErrorCodes.AUTH_FAILED,
        "Invalid credentials",
        { kind: "auth"}
      )
    }

  }
}

module.exports = AuthProcessor
