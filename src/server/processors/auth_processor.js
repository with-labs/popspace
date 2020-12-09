class AuthProcessor {
  async process(mercuryEvent, participants) {
    switch(mercuryEvent.kind()) {
      case "auth":
        return this.authenticate(mercuryEvent, participants)
      default:
        return mercuryEvent.senderParticipant().sendError(
          mercuryEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${mercuryEvent.kind()}`
        )
    }
  }

  async authenticate(event, participants) {
    const sender = event.senderParticipant()
    const payload = event.payload()
    const success = await sender.authenticate(payload.token, payload.roomName)
    if(success) {
      await participants.joinRoom(sender)
      const authData = await this.getAuthData(event, participants)
      sender.sendResponse(event, authData)
      // TODO: get data for new particpant
      sender.broadcastPeerEvent("room/participantJoined", {})
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
    const user = event.senderUser()
    const room = await lib.roomData.getRoomData(event.roomId())
    const serializedParticipants = await participants.serialize(room.id)
    return { room, user, participants: serializedParticipants }
  }

}

module.exports = AuthProcessor
