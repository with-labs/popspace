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
    log.app.info(`Adding participant to ${this.id}: ${this._participants.length}`)
    this._participants.push(participant)
    log.app.info(`Added participant to ${this.id}: ${this._participants.length}`)
  }

  removeParticipant(participant)  {
    let index = this._participants.find((p) => (p == participant))
    log.app.info(`Removing participant ${this._participants.length}`)
    if(index > -1) {
      this._participants.splice(index, 1)
      log.app.info(`Removed participant ${this._participants.length}`)
    } else {
      log.app.info(`${index} Removed failed for ${participant.id}: ${this._participants.length} ${JSON.stringify(this._participants.map((p) => (p.id + " " + (p==participant))))}`)
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
