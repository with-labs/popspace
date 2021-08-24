/**
  Represents events sent from peers
*/
class PeerEvent {
  constructor(sender, kind, payload, eventId=null) {
    this._data = {
      kind: kind,
      payload: payload,
      sender: sender
    }
    if(eventId) {
      /*
        Event ids are useful to react to responses:
        each response will provide the request event id,
        so the sender can resolve it.

        If a response is not expected, there is no need to provide an id.
      */
      this._data.id = eventId
    }
  }

  requestId() {
    return this._data.id
  }

  kind() {
    return this._data.kind
  }

  payload() {
    return this._data.payload
  }

  sender() {
    return this._data.sender
  }

  serialize() {
    return {
      sender: {
        actorId: this.sender().actorId(),
        sessionId: this.sender().sessionId()
      },
      kind: this.kind(),
      payload: this.payload(),
      requestId: this.requestId()
    }
  }
}

PeerEvent.fromMessage = function(sender, message) {
  let data = null
  try {
    data = shared.db.serialization.deserialize(message)
  } catch(e) {
    throw new lib.event.HermesError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "events must be JSON")
  }
  if(!data.kind) {
    throw new lib.event.HermesError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "event field 'kind' required")
  }
  return new PeerEvent(sender, data.kind, data.payload || {}, data.id)
}

module.exports = PeerEvent
