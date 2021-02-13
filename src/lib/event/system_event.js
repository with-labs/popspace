/*
  If we're serious about using these,
  e.g. to make sure each event is handled only once,
  we can get them from a persisted source or use udid
*/
let eventId = 0
class SystemEvent {
  constructor(payload) {
    this._payload = payload
    this._eventId = eventId++
  }

  kind() {
    return "system"
  }

  payload() {
    return this._payload
  }

  eventId() {
    return this._eventId
  }

  serialize() {
    return {
      kind: this.kind(),
      payload: this.payload(),
      event_id: this.eventId()
    }
  }
}

module.exports = SystemEvent
