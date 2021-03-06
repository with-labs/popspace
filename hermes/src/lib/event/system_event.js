/*
  If we're serious about using these,
  e.g. to make sure each event is handled only once,
  we can get them from a persisted source or use udid
*/
let eventId = 0
/**
  Represents an event that does not have a sender actor.
  It could be generated because parts of the system configuration changed
  from some internal sequence of events, or it could be from
  actor action where the actor doesn't matter.

  One example is a premium subscription expiring, and perhaps
  that decreases the maximum participant limit.

  Another is a shareable invite link being disabled -
  we probably don't care who disabled it, we only care
  to update the UI.
*/
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
      eventId: this.eventId()
    }
  }
}

module.exports = SystemEvent
