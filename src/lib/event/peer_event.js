const snakecaseKeys = require('snakecase-keys')

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
        user_id: this.sender().userId(),
        session_id: this.sender().sessionId()
      },
      kind: this.kind(),
      payload: this.payload(),
      request_id: this.requestId()
    }
  }
}

PeerEvent.fromMessage = function(sender, message) {
  let data = null
  try {
    // Convert to snake case, because raw data fields are snake case.
    // We use snake case because some databases (like postgres)
    // are weird wrt case-insensitivity:
    // in psql, double quotes turn a column name into case-sensitive,
    // so a query like "select widget_id from room_widgets;" becomes
    // 'select "WidgetId" from "RoomWidgets";'.
    data = snakecaseKeys(JSON.parse(message))
  } catch(e) {
    throw new lib.event.MercuryError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "events must be JSON")
  }
  if(!data.kind) {
    throw new lib.event.MercuryError(lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "event field 'kind' required")
  }
  return new PeerEvent(sender, data.kind, data.payload || {}, data.id)
}

module.exports = PeerEvent
