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

  async authenticate(mercuryEvent, participants) {
    const payload = mercuryEvent.payload()
    const room = await shared.db.rooms.roomByName(payload.room_name)
    const sender = mercuryEvent.senderParticipant()

    if(!room) {
      return sender.sendError(
        mercuryEvent,
        shared.error.code.UNKNOWN_ROOM,
        `No such room`,
        {room_route: payload.room_name}
      )
    }

    const socketGroup = participants.getSocketGroup(room.id)
    if(socketGroup && socketGroup.hasExceededMaxParticipantsLimit()) {
      return sender.sendError(
        mercuryEvent,
        lib.ErrorCodes.TOO_MANY_PARTICIPANTS,
        `The current participant limit has been exceeded.`,
        {limit: socketGroup.getMaxParticipants()}
      )
    }

    const success = await sender.authenticate(payload.token, payload.room_name)
    if(success) {
      /*
        TODO: it'd be nice to get rid of this participants reference.
        Some options:
        1. sender emits an event that participants listen on and handle room joining
        2. MercuryEvent has the relevant socket group
        3. socket groups or participants available globally
      */
      await participants.joinRoom(sender)
      const authData = await this.getAuthData(mercuryEvent)
      sender.sendResponse(mercuryEvent, authData)
      sender.broadcastPeerEvent("participantJoined", sender.serialize())
    } else {
      return sender.sendError(
        mercuryEvent,
        lib.ErrorCodes.AUTH_FAILED,
        "Invalid credentials"
      )
    }
  }

  async getAuthData(mercuryEvent) {
    const actor = mercuryEvent.senderActor()
    const participant = mercuryEvent.senderParticipant()
    const roomId = mercuryEvent.roomId()
    const room = await lib.roomData.getRoomData(roomId)

    const peers = participant.listPeersIncludingSelf()
    const serializedParticipants = peers.map((p) => (p.serialize()))

    return { room, self: participant.serialize(), participants: serializedParticipants }
  }

}

module.exports = AuthProcessor
