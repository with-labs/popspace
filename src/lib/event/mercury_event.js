/**
  Internal mercury events - not sent over the network.
  Wraps a PeerEvent with additional processing meta-info.
*/
module.exports = class MercuryEvent {
  constructor(sender, message) {
    this._sender = sender
    this._message = message
    this.peerEvent = lib.event.PeerEvent.fromMessage(message)
  }

  kind() {
    return this.peerEvent.kind()
  }

  requestId() {
    return this.peerEvent.eventId()
  }

  payload() {
    return this.peerEvent.payload()
  }

  room() {
    return this._sender.room
  }

  roomId() {
    return this._sender.room.id
  }

  senderUser() {
    return this._sender.user
  }

  senderParticipant() {
    return this._sender
  }

  sourceEvent() {
    return this.peerEvent
  }

  // Non-serializable: represents events internal to mercury, carrying serializable network events

}
