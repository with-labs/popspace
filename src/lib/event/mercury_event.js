

module.exports = class MercuryEvent {
  constructor(sender, message) {
    const data = JSON.parse(message)
    this._sender = sender
    this._message = message
      // only allow in-room requests
    this.roomId = data.kind == "auth" ? data.payload.roomId : sender.roomId
    this.data = data
    this.peerEvent = new lib.event.PeerEvent(message)
  }


}
