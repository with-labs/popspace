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
      sender.broadcastPeerEvent("room/participantJoined", sender.serialize())
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
    const participant = event.senderParticipant()
    const roomId = event.roomId()
    const room = await lib.roomData.getRoomData(roomId)

    const peers = participant.listPeersIncludingSelf()
    const serializedParticipants = peers.map((p) => (p.serialize()))

    return { room, user, participants: serializedParticipants }
  }

}

module.exports = AuthProcessor
