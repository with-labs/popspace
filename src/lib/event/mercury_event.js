/**
  Internal mercury events - not sent over the network.
  Wraps a PeerEvent with additional processing meta-info.
*/
module.exports = class MercuryEvent {
  constructor(sender, message) {
    this._sender = sender
    this._message = message
    this._sourceEvent = lib.event.PeerEvent.fromMessage(sender, message)
  }

  kind() {
    return this._sourceEvent.kind()
  }

  requestId() {
    return this._sourceEvent.requestId()
  }

  payload() {
    return this._sourceEvent.payload()
  }

  room() {
    return this._sender.room
  }

  roomId() {
    return this._sender.room.id
  }

  actorId() {
    return this.senderActor().id
  }

  sessionId() {
    return this._sender.sessionId()
  }

  senderActor() {
    return this._sender.actor
  }

  senderParticipant() {
    return this._sender
  }

  sourceEvent() {
    return this._sourceEvent
  }

  // Non-serializable: represents events internal to mercury, carrying serializable network events

}
