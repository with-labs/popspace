
// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0

class Participant {
  constructor(socket) {
    this.socket = socket
    this.id = id++
    this.authenticated = false
    this.user = {}
    this.room = {}

    this.socket.on('message', (message) => {
      /* TODO:
        - ratelimit
        - sanitize input: protect from js-injection attacks on peers
      */
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

  async authenticate(token, roomName) {
    /*
      It seems that the JS WebSockets API doesn't well support setting custom headers
      when the connection is being established. A reasonable alternative is to send
      an authentication request after the connection is established.
      https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
    */
    this.user = await shared.lib.auth.userFromToken(token)
    this.room = await shared.db.rooms.roomByName(roomName)
    if(!this.user || !this.room) {
      this.authenticated = false
      this.room = {}
      this.user = {}
      return false
    }
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

  sendResponse(requestEvent, response = {}) {
    // TODO:
    // Do we want to establish a generic nested structure?
    // { requestId, kind, payload: {}} ?
    // We may want to specify "kind" differently then
    this.sendObject(Object.assign({
      requestId: requestEvent.data.id,
      kind: response.kind || "response"
    }, response))
  }

  sendError(requestEvent, errorCode, errorMessage, errorObject={}) {
    this.sendResponse(requestEvent, Object.assign({
      code: errorCode,
      message: errorMessage,
      kind: "error"
    }, errorObject))
  }

  async disconnect() {
    this.authenticated = false
    this.socket.close()
    return new Promise((resolve, reject) => {
      this.socket.on('close', () => (resolve()))
    })
  }

  async serialize() {
    return {
      authenticated: this.authenticated,
      user: {
        displayName: this.user.display_name,
        id: this.user.id
      },
      sessionId: this.id,
      roomId: this.room.id
    }
  }
}

module.exports = Participant
