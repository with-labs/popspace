/**
  Represents an error that was triggered by a PeerEvent
*/
module.exports = class ErrorEvent {
  constructor(sourceMercuryEvent, errorCode, errorMessage, payload) {
    this.sourceMercuryEvent = sourceMercuryEvent
    this.errorCode = errorCode
    this.errorMessage = errorMessage
    this.payload = payload
    this.kind = 'error'
  }

  serialize() {
    return {
      request_id: this.sourceMercuryEvent.requestId(),
      code: this.errorCode,
      message: this.errorMessage,
      kind: this.kind,
      payload: this.payload
    }
  }
}
