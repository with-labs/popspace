/**
  Represents an event that was triggered by a PeerEvent
*/
module.exports = class ResponseEvent {
  constructor(sourceHermesEvent, payload, kind) {
    this._sourceHermesEvent = sourceHermesEvent
    this._data = {
      payload: payload,
      kind: kind || `${sourceHermesEvent.kind()}.response`,
      request_id: sourceHermesEvent.requestId()
    }
  }

  sourceKind() {
    return this._sourceHermesEvent.kind()
  }

  kind() {
    return this._data.kind
  }

  hermesEvent() {
    return this._sourceHermesEvent
  }

  roomId() {
    return this._sourceHermesEvent.roomId()
  }

  serialize() {
    const serialized = Object.assign({}, this._data)
    serialized.sender = {
      actor_id: this._sourceHermesEvent.actorId(),
      session_id: this._sourceHermesEvent.sessionId()
    }
    return serialized
  }
}
