
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
        const event = new lib.event.MercuryEvent(this, message)
        if(this.eventHandler) {
          this.eventHandler(event)
        }
      } catch(e) {
        log.app.error(e)
        this.sendError({}, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid JSON", {source: message})
      }
    })
  }

  roomId() {
    return this.room.id
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

  sendResponse(requestEvent, payload={}, kind=null) {
    const responseEvent = new lib.event.ResponseEvent(requestEvent, payload, kind)
    this.sendObject(responseEvent.serialize())
  }

  sendError(requestEvent, errorCode, errorMessage, payload={}) {
    const errorEvent = new lib.event.ErrorEvent(requestEvent, errorCode, errorMessage, payload)
    this.sendObject(errorEvent.serialize())
  }

  async disconnect() {
    this.authenticated = false
    return new Promise((resolve, reject) => {
      this.socket.on('close', () => (resolve()))
      this.socket.close()
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
