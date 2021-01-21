/*
  Represents a living/dynamic manifestation of a room:
  the currently connected group of people through
  that room.
*/

let id = 0

class SocketGroup {
  constructor(room) {
    this.id = id++
    this._room = room
    this._participants = []
  }

  getRoom() {
    return this._room
  }

  addParticipant(participant) {
    this._participants.push(participant)
  }

  removeParticipant(participant)  {
    const index = this._participants.find((p) => (p == participant))
    if(index > -1) {
      this._participants.splice(index, 1)
    }
  }

  participants() {
    return this._participants
  }

  authenticatedParticipants() {
    return this._participants.filter((p) => (p.authenticated))
  }

  broadcastPeerEvent(sender, kind, payload, eventId=null) {
    for(const participant of this._participants) {
      if(participant != sender) {
        participant.sendPeerEvent(sender, kind, payload, eventId)
      }
    }
  }

}

module.exports = SocketGroup
