const Processor = require("./processor")

class MutateProcessor extends Processor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "room/moveObject":
        return this.moveObject(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.data.kind}`
        )
    }
  }

  async moveObject(event, participants) {
  }
}

module.exports = MutateProcessor
