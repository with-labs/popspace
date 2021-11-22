class PassthroughProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "echo":
        return await this.sendEcho(hermesEvent)
      case "ping":
        return await this.processPing(hermesEvent)
      case "passthrough":
        return await this.processPassthrough(hermesEvent)
      default:
        return hermesEvent.senderParticipant().sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
        )
    }
  }

  async sendEcho(hermesEvent) {
    const sender = hermesEvent.senderParticipant()
    sender.broadcastPeerEvent(hermesEvent.kind(), hermesEvent.payload())
    sender.sendResponse(hermesEvent, { received: true })
  }

  async processPing(hermesEvent) {
    const sender = hermesEvent.senderParticipant()
    sender.keepalive()
    sender.sendResponse(hermesEvent, { received: true }, "pong")
  }

  async processPassthrough(hermesEvent) {
    const sender = hermesEvent.senderParticipant()
    sender.broadcastPeerEvent(hermesEvent.kind(), hermesEvent.payload())
  }
}

module.exports = PassthroughProcessor
