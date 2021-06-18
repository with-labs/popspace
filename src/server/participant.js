const ws = require('ws')
const userAgentParser = require('ua-parser-js')

const AsyncLock = require('async-lock')
const lock = new AsyncLock();

const DEFAULT_STATE_IN_ROOM = {
  position: {
    x: 0,
    y: 0
  },
  emoji: null,
  status: null
}

/*
  Require that actors authenticate within a certain time
  to avoid zombie socket connections
*/
const COUNTDOWN_TO_AUTHENTICATE_MILLIS = 120000
// TODO: eventually we'll care to recycle these, or make them more semantic
let id = 0


class Participant {
  constructor(socket, req, heartbeatTimeoutMillis) {
    /*
      req is the original express request from when the http upgrade
      call happened.
    */
    this.req = req
    this.socket = socket
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis

    this.dieFromTimeout = () => {
      log.app.info(`${this.sessionName()} Participant dying from timeout`)
      this.disconnect()
    }

    this.dieFromNoAuth = () => {
      // I think we currently rely on connecting to hermes w/o authenticating
      // in the dashboard; but we should move away from that behavior

      // log.app.info(`${this.sessionName()} Participant dying after failing to authenticate within time limit`)
      // this.disconnect()
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
      // if(!this.ready) {
        // log.error.error(`Receiving message on socket that's not ready ${message}`)
        // return this.sendError(null, lib.ErrorCodes.SOCKET_NOT_READY, "Please wait for an event with kind=='system', {socketReady: true}")
      // }
      /* TODO:
        - ratelimit
        - sanitize input: protect from js-injection attacks on peers
      */
      console.log("======== got message", message)
      log.received.info(`${this.sessionName()} ${message}`)
      log.dev.debug(`${this.sessionName()} Got message ${message}`)
      let event = null
      try {
        event = new lib.event.HermesEvent(this, message)
      } catch {
        log.app.error(`${this.sessionName()}  Invalid event format ${message}`)
        return this.sendError(null, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid JSON", {source: message})
      }

      try {
        console.log("Handling", this.eventHandler)
        if(this.eventHandler) {
          console.log("Processing", this.eventHandler)
          this.eventHandler(event)
        }
      } catch(e) {
        log.app.error(e)
        return this.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, "Invalid event", {source: message})
      }
    })

    this.dieUnlessAuthenticate()
  }

  async init(roomId, actorId) {
    return await lock.acquire('init_participant', async () => {
      /*
        NOTE: This lock is here to deal with a race condition.
        This is not the most efficient way to do it, but it's simpler and
        gives good guarantees. We can optimize this when we start to have more volume.

        Why is there a race condition?

        Because we'd like to assign a participant to each connecting socket,
        and assigning a participant is an I/O operation.

        In Node.js, I/O operations like database writes are done on separate threads.
        This implies that the HTTP UPGRADE request to create the socket will return
        before the participant is created in the database.

        We need the participant ID to finish socket setup, because participants tracks
        each participant by their ID. Until that happens, we can not receive messages.

        1. We can, for example, block the auth message until the socket is initialized.
        2. We can also handle the ID creation in a callback, and only then key the participant by their ID in participants.
        3. Or we can risk initializing twice: init in participants, await on the init,
        but also allow an init in auth, but handle the race condition.

        This is solution (3). Solution (1) is also possible, since we send the system message
        at the end. Solution (2) may have some underwater stones that aren't immediately obvious.

        With (2) we run into a different kind of race condition. Suppose the participant enters,
        then leaves immediately. The delete callback finishes, and after that the init callback finishes,
        and we leak memory tracking participants. Obviously it's possible to deal with, but what seemed like
        a simpler solution quickly becomes more complex.

        Since testing this is very difficult and time-consuming, I'm doing both (3) and allowing (1)
        as a failsafe until we can invest more into rigor and efficiency.
      */
      if(this.dbParticipant) {
        /*
          These in-memory participants should be 1:1 to DB participants.

          If a new database participant is needed, a new in-memory one should be created.
        */
        log.error.warn(`${this.sessionName()} Attempting to re-create participant`)
        return this.dbParticipant
      }
      const ua = userAgentParser(this.req.headers['user-agent'] || "")
      this.dbParticipant = await shared.db.pg.massive.participants.insert({
        room_id: roomId,
        actor_id: actorId,
        ip: this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress,
        browser: ua.browser.name,
        device: ua.device.type,
        vendor: ua.device.vendor,
        engine: ua.engine.name,
        os: ua.os.name,
        os_version: ua.os.version,
        engine_version: ua.engine.version,
        browser_version: ua.browser.version,
        user_agent: this.req.headers['user-agent']
      })
      log.app.info(`New participant ${this.dbParticipant.id}`)
      if(this.initHandler) {
        this.initHandler(this)
      }
      this.ready = true
      this.sendEvent(new lib.event.SystemEvent({socketReady: true}))

      return this.dbParticipant
    })
  }

  get id() {
    return this.dbParticipant ? this.dbParticipant.id : null
  }

  sessionName() {
    return `(aid ${this.actorId()}, rid ${this.roomId()}, pid ${this.id})`
  }

  keepalive() {
    clearTimeout(this.heartbeatTimeout)
    this.heartbeatTimeout = setTimeout(this.dieFromTimeout, this.heartbeatTimeoutMillis)
    log.app.info(`${this.sessionName()} Keepalive`)
    /*
      We don't really need to do this synchronously,
      since we expect write time to be much less than the time between heartbeats
    */
    lib.analytics.updateSessionLength(this)
    lib.analytics.updateVoiceDuration(this)
    lib.analytics.updateVideoDuration(this)
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

  getRoom() {
    return this.room
  }

  actorId() {
    return this.actor.id
  }

  listPeersIncludingSelf() {
    return (this.socketGroup ? this.socketGroup.authenticatedParticipants() : [])
  }

  async authenticate(token, roomRoute) {
    /*
      It seems that the JS WebSockets API doesn't well support setting custom headers
      when the connection is being established. A reasonable alternative is to send
      an authentication request after the connection is established.
      https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
    */
    this.actor = await shared.lib.auth.actorFromToken(token)
    this.room = await shared.db.room.core.roomByRoute(roomRoute)
    if(!this.actor || !this.room) {
      this.unauthenticate()
      return false
    }
    const canEnter = await shared.db.room.permissions.canEnter(this.actor, this.room)

    if(!canEnter) {
      this.unauthenticate()
      return false
    }
    const isMember = await shared.db.room.memberships.isMember(this.actor.id, this.room.id)
    if(!isMember) {
      /*
        If the actor is allowed entry and is not a member,
        they should become a member.
      */
      await shared.db.room.memberships.forceMembership(this.room, this.actor)
    }
    await this.getTransform()
    await this.getState()

    if(!this.dbParticipant) {
      await this.init(this.room.id, this.actor.id)
    } else {
      this.dbParticipant = await shared.db.pg.massive.participants.update({id: this.id}, {
        room_id: this.room.id,
        actor_id: this.actor.id
      })
    }

    this.authenticated = true
    clearTimeout(this.dieUnlessAuthenticateTimeout)
    log.app.info(`${this.sessionName()} Authenticated`)
    if(this.authHandler) {
      this.authHandler(this)
    }
    return true
  }

  getSocketGroup() {
    return this.socketGroup
  }

  async joinSocketGroup(socketGroup) {
    await this.leaveSocketGroup()
    this.socketGroup = socketGroup
    await socketGroup.addParticipant(this)
    this.keepalive()
    log.app.info(`${this.sessionName()} Joined socket group`)
    await lib.analytics.participantJoinedSocketGroup(socketGroup)
    await lib.analytics.beginSession(this, socketGroup)
  }

  async leaveSocketGroup() {
    clearTimeout(this.heartbeatTimeout)
    if(this.socketGroup) {
      const socketGroup = this.socketGroup
      this.socketGroup = null
      await socketGroup.removeParticipant(this)
      socketGroup.broadcastPeerEvent(this, "participantLeft", { sessionId: this.id })
      await lib.analytics.participantLeft(socketGroup)
    }
  }

  isAuthenticated() {
    return this.authenticated
  }

  async hasAuthorizedRoomAccess() {
    if(!this.authenticated) {
      return false
    }
    return await shared.db.room.permissions.canEnter(this.actor, this.room)
  }

  setEventHandler(handler) {
    // Events are JSON objects sent over the socket
    this.eventHandler = handler
  }

  setAuthHandler(handler) {
    this.authHandler = handler
  }

  setInitHandler(handler) {
    this.initHandler = handler
  }

  sendEvent(event) {
    const message = JSON.stringify(lib.util.snakeToCamelCase(event.serialize()))
    log.sent.info(`${this.sessionName()} ${message}`)
    this.socket.send(message)
  }

  broadcastPeerEvent(kind, payload, eventId=null) {
    if(!this.socketGroup) {
      throw "Must authenticate before broadcasting"
    }
    this.socketGroup.broadcastPeerEvent(this, kind, payload, eventId)
  }

  sendResponse(requestEvent, payload={}, kind=null) {
    this.sendEvent(new lib.event.ResponseEvent(requestEvent, payload, kind))
  }

  respondAndBroadcast(hermesEvent, kind) {
    if(hermesEvent.senderParticipant() != this) {
      log.error.error(`Can only respond to sender ${hermesEvent.senderParticipant().actorId()} vs ${this.actorId()}`)
      /*
        We could throw an exception.

        But that could crash the server, and break the service for everyone.

        I don't think there's a need to be so drastic in this case.
        We can log the issue and drop the event.
      */
      return
    }
    this.broadcastPeerEvent(kind, hermesEvent.payload())
    this.sendResponse(hermesEvent, hermesEvent.payload(), kind)
  }

  sendPeerEvent(sender, kind, payload, eventId=null) {
    this.sendEvent(new lib.event.PeerEvent(sender, kind, payload, eventId))
  }

  sendSystemEvent(payload) {
    this.sendEvent(new lib.event.SystemEvent(payload))
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
      this.participantState = await shared.db.room.data.getParticipantState(this.actor.id)
      this.participantState = this.participantState || {}
      if(!this.participantState.display_name) {
        /*
          TODO: delete this. The source of truth for display_names
          should be just the room.

          But let's not break existing client code and just do the migration
          slowly.
        **/
        this.participantState.display_name = this.actor.display_name
        await shared.db.room.data.setParticipantState(this.actor.id, this.participantState)
      }
      return this.participantState
    }
  }

  async getTransform() {
    if(this.transform) {
      return this.transform
    }
    const roomId = this.roomId()
    const actorId = this.actorId()
    this.transform = await shared.db.room.data.getRoomParticipantState(roomId, actorId)
    if(!this.transform) {
      this.transform = DEFAULT_STATE_IN_ROOM
      await shared.db.room.data.setRoomParticipantState(roomId, actorId, this.transform)
    }
    return this.transform
  }

  async updateTransform(newTransform, sourceEvent=null) {
    this.transform = await shared.db.room.data.updateRoomParticipantState(
      this.roomId(),
      this.actorId(),
      newTransform
    )
    if(sourceEvent) {
      return this.respondAndBroadcast(sourceEvent, "participantTransformed")
    } else {
      log.error.warn("Dropping updateTransform - sourceEvent missing")
      /*
        We should probably still send the updated position to everyone,
        but it won't be a response.
      */
    }
  }

  async updateState(newState, sourceEvent=null) {
    this.participantState = await shared.db.room.data.updateParticipantState(
      this.actorId(),
      newState
    )
    if(sourceEvent) {
      return this.respondAndBroadcast(sourceEvent, "participantUpdated")
    } else {
      log.error.warn("Dropping updateTransform - sourceEvent missing")
    }
  }

  unauthenticate() {
    this.authenticated = false
    this.actor = {}
    this.room = {}
    this.transform = null
    this.participantState = null
    this.dieUnlessAuthenticate()
  }

  serialize() {
    return {
      authenticated: this.authenticated,
      actor: {
        id: this.actor.id
      },
      sessionId: this.id,
      roomId: this.room.id,
      transform: this.transform,
      participantState: this.participantState
    }
  }
}

module.exports = Participant
