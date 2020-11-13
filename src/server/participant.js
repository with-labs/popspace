// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0

class Participant {
  constructor(socket) {
    this.socket = socket
    this.id = id++
  }

  setMessageHandler(handler) {
    this.socket.on('message', (message) => {
      handler(this, message)
    });
  }

  send(message) {
    this.socket.send(message)
  }

  disconnect() {
    this.socket.close()
  }
}

module.exports = Participant
