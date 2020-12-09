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
      // TODO: if participants knew their room peers, we could have a better API
      // (specifically, we could do participant.broadcast(), and hide lower level ways of messaging)
      sender.sendResponse(event, authData)
      // TODO: get data for new particpant
      const joinEvent = new lib.event.PeerEvent("room/participantJoined", {})
      participants.broadcastEventFrom(sender, joinEvent)
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
