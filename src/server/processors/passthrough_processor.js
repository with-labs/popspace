class PassthroughProcessor {
  async process(mercuryEvent) {
    switch(mercuryEvent.kind()) {
      case "echo":
        return await this.sendEcho(mercuryEvent)
      case "ping":
        return await this.processPing(mercuryEvent)
      case "passthrough":
        return await this.processPassthrough(mercuryEvent)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async sendEcho(mercuryEvent) {
    const sender = mercuryEvent.senderParticipant()
    sender.broadcastPeerEvent(mercuryEvent.kind(), mercuryEvent.payload())
    sender.sendResponse(mercuryEvent, { received: true })
  }

  async processPing(mercuryEvent) {
    const sender = mercuryEvent.senderParticipant()
    sender.keepalive()
    sender.sendResponse(mercuryEvent, { received: true }, "pong")
  }

  async processPassthrough(mercuryEvent) {
    const sender = mercuryEvent.senderParticipant()
    sender.broadcastPeerEvent(mercuryEvent.kind(), mercuryEvent.payload())
  }
}

module.exports = PassthroughProcessor
