/**
  Represents an event that was triggered by a PeerEvent
*/
module.exports = class ResponseEvent {
  constructor(sourceMercuryEvent, payload, kind) {
    this._sourceMercuryEvent = sourceMercuryEvent
    this._data = {
      payload: payload,
      kind: kind || `${sourceMercuryEvent.kind()}.response`,
      request_id: sourceMercuryEvent.requestId()
    }
  }

  sourceKind() {
    return this._sourceMercuryEvent.kind()
  }

  kind() {
    return this._data.kind
  }

  mercuryEvent() {
    return this._sourceMercuryEvent
  }

  roomId() {
    return this._sourceMercuryEvent.roomId()
  }

  serialize() {
    return Object.assign({}, this._data)
  }
}
