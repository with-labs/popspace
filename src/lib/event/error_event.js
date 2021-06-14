/**
  Represents an error that was triggered by a PeerEvent
*/
module.exports = class ErrorEvent {
  constructor(sourceHermesEvent, errorCode, errorMessage, payload) {
    this.sourceHermesEvent = sourceHermesEvent
    this.errorCode = errorCode
    this.errorMessage = errorMessage
    this.payload = payload
    this.kind = 'error'
  }

  serialize() {
    return {
      request_id: this.sourceHermesEvent ? this.sourceHermesEvent.requestId() : null,
      code: this.errorCode,
      message: this.errorMessage,
      kind: this.kind,
      payload: this.payload
    }
  }
}
