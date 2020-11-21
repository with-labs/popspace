// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0

class Participant {
  constructor(socket) {
    this.socket = socket
    this.id = id++
    this.authenticated = false
    this.user = null
    this.roomId = null
    this.room = null

    this.socket.on('message', (message) => {
      log.dev.debug(`Got message from ${this.id} ${message}`)
      try {
        const event = this.prepareEvent(message)
        if(this.eventHandler) {
          this.eventHandler(event)
        }
      } catch(e) {
        if(this.messageHandler) {
          this.messageHandler(this, message)
        }
      }
    })
  }

  prepareEvent(message) {
    const data = JSON.parse(message)
    return {
      _sender: this,
      _message: message,
      // only allow in-room requests
      roomId: data.kind == "auth" ? data.payload.roomId : this.roomId,
      data: data
    }
  }

  async authenticate(token, roomId) {
    /*
      It seems that the JS WebSockets API doesn't well support setting custom headers
      when the connection is being established. A reasonable alternative is to send
      an authentication request after the connection is established.
      https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
    */
    this.user = await shared.lib.auth.userFromToken(token)
    this.room = await shared.db.pg.massive.rooms.findOne({id: roomId})
    if(!this.user || !this.room) {
      this.authenticated = false
      this.roomId = null
      this.room = null
      this.user = null
      return false
    }
    this.roomId = roomId
    this.authenticated = true
    return true
  }

  isAuthenticated() {
    return this.authenticated
  }

  setMessageHandler(handler) {
    // Messages are any text sent over the socket
    this.messageHandler = handler
  }

  setEventHandler(handler) {
    // Events are JSON objects sent over the socket
    this.eventHandler = handler
  }

  send(message) {
    this.socket.send(message)
  }

  sendObject(object) {
    this.send(JSON.stringify(object))
  }

  sendResponse(requestEvent, response) {
    this.sendObject(Object.assign({
      requestId: requestEvent.data.id
    }, response))
  }

  sendError(requestEvent, errorCode, errorMessage, errorObject={}) {
    this.sendResponse(requestEvent, Object.assign({
      code: errorCode,
      message: errorMessage
    }, errorObject))
  }

  async disconnect() {
    this.authenticated = false
    this.socket.close()
    return new Promise((resolve, reject) => {
      this.socket.on('close', () => (resolve()))
    })
  }
}

module.exports = Participant
