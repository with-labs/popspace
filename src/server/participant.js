const ws = require('ws')
const camelcaseKeys = require('camelcase-keys')

const DEFAULT_STATE_IN_ROOM = {
  position: {
    x: 0,
    y: 0
  },
  emoji: null,
  status: null
}

/*
  Require that users authenticate within a certain time
  to avoid zombie socket connections
*/
const COUNTDOWN_TO_AUTHENTICATE_MILLIS = 120000

/* The JSON API is camelcase, but the database has underscore column names */
const CAMELCASE_DEEP = { deep: true }

// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0


class Participant {
  constructor(socket, heartbeatTimeoutMillis) {
    this.socket = socket
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis
    this.id = id++ // perhaps a decent more verbose name is sessionId

    log.app.info(`New participant ${this.id}`)

    this.dieFromTimeout = () => {
      log.app.info(`Participant dying from timeout ${this.sessionName()}`)
      this.disconnect()
    }

    this.dieFromNoAuth = () => {
      log.app.info(`Participant dying after failing to authenticate within time limit ${this.sessionName}`)
      this.disconnect()
    }

    this.unauthenticate()

    this.socket.on('disconnect', () => {
      clearTimeout(this.heartbeatTimeout)
      clearTimeout(this.dieUnlessAuthenticateTimeout)
      this.leaveSocketGroup()
    })

    this.socket.on('close', () => {
      clearTimeout(this.heartbeatTimeout)
      clearTimeout(this.dieUnlessAuthenticateTimeout)
      this.leaveSocketGroup()
    })

    this.socket.on('message', (message) => {
      /* TODO:
        - ratelimit
        - sanitize input: protect from js-injection attacks on peers
      */
      log.received.info(message)
      log.dev.debug(`Got message from ${this.sessionName()} ${message}`)
      let event = null
      try {
        event = new lib.event.MercuryEvent(this, message)
      } catch {
        log.app.error(`Invalid event format ${this.sessionName()} ${message}`)
        return this.sendError(null, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid JSON", {source: message})
      }

      try {
        if(this.eventHandler) {
          this.eventHandler(event)
        }
      } catch(e) {
        log.app.error(e)
        return this.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid event", {source: message})
      }
    })

    this.keepalive()
    this.dieUnlessAuthenticate()
  }

  sessionName() {
    return `(uid ${this.userId()}, rid ${this.roomId()}, pid ${this.id}, sg ${this.socketGroup ? this.socketGroup.id : null})`
  }

  keepalive() {
    clearTimeout(this.heartbeatTimeout)
    this.heartbeatTimeout = setTimeout(this.dieFromTimeout, this.heartbeatTimeoutMillis)
    log.app.info(`Keepalive ${this.sessionName()}`)
  }

  dieUnlessAuthenticate() {
    this.dieUnlessAuthenticateTimeout = setTimeout(this.dieFromNoAuth, COUNTDOWN_TO_AUTHENTICATE_MILLIS)
  }

  sessionId() {
    return this.id
  }

  roomId() {
    return this.room.id
  }

  userId() {
    return this.user.id
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
      this.unauthenticate()
      return false
    }
    const hasAccess = await shared.db.roomMemberships.hasAccess(this.user.id, this.room.id)
    if(!hasAccess) {
      this.unauthenticate()
      return false
    }

    this.transform = await lib.roomData.dynamo.getRoomParticipantState(this.room.id, this.user.id)
    if(!this.transform) {
      this.transform = DEFAULT_STATE_IN_ROOM
      await lib.roomData.addParticipantInRoom(this.room.id, this.user.id, this.transform)
    }
    await this.getState()
    this.authenticated = true
    clearTimeout(this.dieUnlessAuthenticateTimeout)
    log.app.info(`Authenticated ${this.sessionName()}`)
    return true
  }

  getSocketGroup() {
    return this.socketGroup
  }

  async joinSocketGroup(socketGroup) {
    await this.leaveSocketGroup()
    this.socketGroup = socketGroup
    socketGroup.addParticipant(this)
    this.keepalive()
    await lib.analytics.participantJoinedSocketGroup(socketGroup)
  }

  async leaveSocketGroup() {
    clearTimeout(this.heartbeatTimeout)
    if(this.socketGroup) {
      const socketGroup = this.socketGroup
      this.socketGroup = null
      socketGroup.removeParticipant(this)
      socketGroup.broadcastPeerEvent(this, "participantLeft", { sessionId: this.id })
      await lib.analytics.participantLeft(socketGroup)
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
    const message = JSON.stringify(camelcaseKeys(event.serialize(), CAMELCASE_DEEP))
    log.sent.info(`${this.sessionName()} ${message}`)
    this.socket.send(message)
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
    await this.leaveSocketGroup()
    this.unauthenticate()
    if([ws.CLOSING, ws.CLOSED].includes(this.socket.readyState)) {
      return true
    }
    return new Promise((resolve, reject) => {
      this.socket.once('close', () => (resolve()))
      this.socket.close()
    })
  }

  async getState() {
    if(this.participantState) {
      return this.participantState
    } else {
      this.participantState = await lib.roomData.dynamo.getParticipantState(this.user.id)
      this.participantState = this.participantState || {}
      if(!this.participantState.display_name) {
        /*
          Perhaps it would be better if these were just set at account creation.
          Even still this fallback wouldn't hurt in case something goes wrong there.
          Originally, the account creation process couldn't have dynamo hooked up,
          as we didn't yet have shared code available to the netlify app.
        **/
        this.participantState.display_name = this.user.display_name
        await lib.roomData.dynamo.setParticipantState(this.user.id, this.participantState)
      }
      return this.participantState
    }
  }

  async getTransform() {
    return this.transform
  }

  updateState(newState) {
    // TODO: maybe move the broadcast and dynamo write out here
    this.participantState = newState
  }

  updateTransform(newTransform) {
    // TODO: maybe move the broadcast and dynamo write out here
    this.transform = newTransform
  }

  unauthenticate() {
    this.authenticated = false
    this.user = {}
    this.room = {}
    this.transform = null
    this.participantState = null
    this.dieUnlessAuthenticate()
  }

  serialize() {
    return {
      authenticated: this.authenticated,
      user: {
        id: this.user.id
      },
      sessionId: this.id,
      roomId: this.room.id,
      transform: this.transform,
      participantState: this.participantState
    }
  }
}

module.exports = Participant
