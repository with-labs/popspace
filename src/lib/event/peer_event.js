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
      this._data.eventId = eventId
    }
  }

  eventId() {
    return this._data.eventId
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
      senderSessionId: this.sender().id,
      kind: this.kind(),
      payload: this.payload(),
      requestId: this.eventId()
    }
  }
}

PeerEvent.fromMessage = function(sender, message) {
  let data = null
  try {
    data = JSON.parse(message)
  } catch(e) {
    throw new lib.event.MercuryError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "events must be JSON")
  }
  if(!data.kind) {
    throw new lib.event.MercuryError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "event field 'kind' required")
  }
  if(!data.payload) {
    throw new lib.event.MercuryError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "event field 'payload' required")
  }
  return new PeerEvent(sender, data.kind, data.payload, data.id)
}

module.exports = PeerEvent
