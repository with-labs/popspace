class AuthProcessor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "auth":
        return this.authenticate(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.kind}`
        )
    }
  }

  async authenticate(event, participants) {
    const sender = event._sender
    const success = await sender.authenticate(event.data.payload.token, event.data.payload.roomName)
    if(success) {
      await participants.joinRoom(sender)
      const authData = await this.getAuthData(event, participants)
      // TODO: convert to object-based events
      return sender.sendResponse(event, {
        kind: "auth.ack",
        success: true,
        data: authData
      })
    } else {
      return sender.sendError(
        event,
        lib.ErrorCodes.AUTH_FAILED,
        "Invalid credentials",
        { kind: "error"}
      )
    }
  }

  async getAuthData(event, participants) {
    const user = event._sender.user
    const room = await lib.roomData.getRoomData(event._sender.room.id)
    const serializedParticipants = await participants.serialize(room.id)
    return { room, user, participants: serializedParticipants }
  }

}

module.exports = AuthProcessor
