/*
  Represents a living/dynamic manifestation of a room:
  the currently connected group of people through
  that room.
*/

class SocketGroup {
  constructor(room) {
    /*
      rooms and socket groups are 1:1
      the concepts are different like a program and a process:
      a room is static, a persistent anchor;
      a socket group is the dynamic in-memory manifestation of a
      networking session anchored to a room.

      The in-memory entity needs an ID, but since they are 1:1 on
      rooms, there is no better ID source than the room itself
    */
    this.id = room.id
    this._room = room
    this._participants = []
  }

  getMaxParticipants() {
    return Infinity
  }

  hasExceededMaxParticipantsLimit() {
    return this._participants.length >= this.getMaxParticipants()
  }

  getId() {
    return this.id
  }

  getRoom() {
    return this._room
  }

  addParticipant(participant) {
    this._participants.push(participant)
  }

  removeParticipant(participant)  {
    let index = this._participants.findIndex((p) => (p == participant))
    if(index > -1) {
      this._participants.splice(index, 1)
      log.app.info(`Removed participant ${this._participants.length}`)
    } else {
      log.app.error(`Removed failed for ${participant.id} in ${this.id}: ${JSON.stringify(this._participants.map((p) => (p.id + " " + (p==participant))))}`)
    }
  }

  participants() {
    return this._participants
  }

  authenticatedParticipants() {
    return this._participants.filter((p) => (p.authenticated))
  }

  broadcastRoomStateFieldChanged(field, newValue) {
    const payload = { kind: "roomStateFieldChange", params: {}}
    payload.params[field] = newValue
    for(const participant of this._participants) {
      participant.sendSystemEvent(payload)
    }
  }

  broadcastSystemEvent(payload) {
    for(const participant of this._participants) {
      participant.sendSystemEvent(payload)
    }
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
