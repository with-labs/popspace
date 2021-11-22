module.exports = class {
  constructor(roomData) {
     // get our own copy as we do indend to keep it updated
    this._roomData = JSON.parse(JSON.stringify(roomData))
  }

  peersExcludingSelf() {
    return this.peersIncludingSelf().filter((p) => (p.sessionId != this.sessionId()))
  }

  peersIncludingSelf() {
    return [...this._roomData.participants]
  }

  authenticatedPeers() {
    return this._roomData.participants.filter((p) => (p.authenticated))
  }

  updatePeer(participant) {
    const existingPeer = this.getPeer(participant)
    if(existingPeer) {
      Object.assign(existingPeer, participant)
    } else {
      this._roomData.participants.push(participant)
    }
  }

  getPeer(participant) {
    const peer = this._roomData.participants.find((p) => {
      return p.sessionId == participant.sessionId
    })
    return peer
  }

  removePeer(participant) {
    const index = this._roomData.participants.findIndex((p) => (p.sessionId == participant.sessionId))
    if(index > -1) {
      this._roomData.participants.splice(index, 1)
    }
  }

  actorId() {
    return this._roomData.self.actor.id
  }

  sessionId() {
    return this._roomData.self.sessionId
  }
}
