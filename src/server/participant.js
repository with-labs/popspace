const ws = require('ws');

const DEFAULT_STATE_IN_ROOM = {
  position: {
    x: 0,
    y: 0
  },
  emoji: null,
  status: null
}

// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0

class Participant {
  constructor(socket) {
    this.socket = socket
    this.id = id++ // perhaps a decent more verbose name is sessionId
    this.authenticated = false
    this.user = {}
    this.room = {}
    this.stateInRoom = null

    this.socket.on('disconnect', () => {
      this.leaveSocketGroup()
    })

    this.socket.on('close', () => {
      this.leaveSocketGroup()
    })

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

  listPeersIncludingSelf() {
    return (this.socketGroup ? this.socketGroup.authenticatedParticipants() : [])
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
    this.stateInRoom = await lib.roomData.dynamo.getParticipantState(this.user.id, this.room.id)
    if(!this.stateInRoom) {
      this.stateInRoom = DEFAULT_STATE_IN_ROOM
      await lib.roomData.addParticipantInRoom(this.room.id, this.user.id, this.stateInRoom)
    }
    this.authenticated = true
    return true
  }

  joinSocketGroup(socketGroup) {
    this.leaveSocketGroup()
    this.socketGroup = socketGroup
    socketGroup.addParticipant(this)
  }

  leaveSocketGroup() {
    if(this.socketGroup) {
      this.socketGroup.removeParticipant(this)
      this.socketGroup.broadcastPeerEvent(this, "room/participantLeft", { sessionId: this.id })
      this.socketGroup = null
    }
  }

  broadcastPeerEvent(kind, payload, eventId=null) {
    if(!this.socketGroup) {
      throw "Must authenticate before broadcasting"
    }
    this.socketGroup.broadcastPeerEvent(this, kind, payload, eventId)
  }

  isAuthenticated() {
    return this.authenticated
  }

  setEventHandler(handler) {
    // Events are JSON objects sent over the socket
    this.eventHandler = handler
  }

  sendEvent(event) {
    this.socket.send(
      JSON.stringify(event.serialize())
    )
  }

  sendResponse(requestEvent, payload={}, kind=null) {
    this.sendEvent(new lib.event.ResponseEvent(requestEvent, payload, kind))
  }

  sendPeerEvent(sender, kind, payload, eventId=null) {
    this.sendEvent(new lib.event.PeerEvent(sender, kind, payload, eventId))
  }

  sendError(requestEvent, errorCode, errorMessage, payload={}) {
    this.sendEvent(new lib.event.ErrorEvent(requestEvent, errorCode, errorMessage, payload))
  }

  async disconnect() {
    this.leaveSocketGroup()
    this.authenticated = false
    if([ws.CLOSING, ws.CLOSED].includes(this.socket.readyState)) {
      return true
    }
    return new Promise((resolve, reject) => {
      this.socket.once('close', () => (resolve()))
      this.socket.close()
    })
  }

  serialize() {
    return {
      authenticated: this.authenticated,
      user: {
        displayName: this.user.display_name,
        id: this.user.id
      },
      sessionId: this.id,
      roomId: this.room.id,
      stateInRoom: this.stateInRoom
    }
  }
}

module.exports = Participant
