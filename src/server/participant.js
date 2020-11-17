// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0

class Participant {
  constructor(socket) {
    this.socket = socket
    this.id = id++
    this.authenticated = false
  }

  async authenticate(token) {

  }

  setMessageHandler(handler) {
    this.socket.on('message', (message) => {
      handler(this, message)
    });
  }

  send(message) {
    this.socket.send(message)
  }

  sendObject(object) {
    this.send(JSON.stringify(object))
  }

  sendError(errorCode, errorMessage, errorObject={}) {
    this.sendObject(Object.assign({
      code: errorCode,
      message: errorMessage
    }, errorObject))
  }

  async disconnect() {
    this.socket.close()
    return new Promise((resolve, reject) => {
      this.socket.on('close', () => (resolve()))
    })
  }
}

module.exports = Participant
