class ClientReceivedEvent {
  constructor(client, message) {
    /*
      For now, let's transition to these,
      and with new code - use getters/setters,
      but also allow old code to work.

      Slowly transition away from directly accessing data,
      and remove this Object.assign
    */
    this._parsed = JSON.parse(message)
    this._client = client
    this._message = message
    Object.assign(this, this._parsed)
  }

  data() {
    return this._parsed
  }
}

module.exports = ClientReceivedEvent
