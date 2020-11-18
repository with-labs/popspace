const Processor = require("./processor")

class AuthProcessor extends Processor {
  async process(event) {
    switch(event.kind) {
      case "auth":
        return this.authenticate(event)
      default:
        return lib.error(lib.ErrorCodes.EVENT_TYPE_INVALID, `Unrecognized event type: ${event.kind}`)
    }
  }

  async authenticate(event) {
    return event.sender.authenticate(event.payload.token, event.payload.roomId)
  }
}

module.exports = AuthProcessor
