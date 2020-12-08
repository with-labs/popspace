module.exports = class PeerEvent {
  constructor(message) {
    const data = JSON.parse(message)
    this._data = data
  }
}
