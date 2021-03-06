const ws = require('ws');
const EventEmitter = require('events');
let count = 0
const ClientRoomData = require('./client_room_data')
const https = require('https')
const btoa = require('btoa')
const fs = require('fs')

const ClientReceivedEvent = require("./client_received_event")

const DEV_ROOTCA = process.env.SSL_ROOTCA_PATH ? fs.readFileSync(process.env.SSL_ROOTCA_PATH, 'utf8') : null

class Client extends EventEmitter {
  constructor(serverUrl, heartbeatIntervalMillis=30000, heartbeatTimeoutMillis=60000) {
    super()
    this.id = count++
    this.eventId = 0
    this.ready = false
    this.serverUrl = serverUrl
    this.messageListeners = {}
    this.promiseResolvers = []

    this.heartbeatIntervalMillis = heartbeatIntervalMillis
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis

    this.heartbeat = async () => {
      clearTimeout(this.heartbeatTimeout)
      const response = await this.sendEventWithPromise("ping", {})
      if(response.kind == "pong") {
        this.heartbeatTimeout = setTimeout(this.dieFromTimeout, this.heartbeatTimeoutMillis)
      } else {
        this.disconnect()
      }
    }

    this.dieFromTimeout = () =>  {
      this.disconnect()
    }
  }

  /**********************************/
  /* API: usually use these methods */
  /**********************************/

  setHeartbeatIntervalMillis(heartbeatIntervalMillis) {
    this.heartbeatIntervalMillis = heartbeatIntervalMillis
    this.stopHeartbeat()
    this.startHeartbeat()
  }

  setHeartbeatTimeoutMillis(heartbeatTimeoutMillis) {
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis
    this.stopHeartbeat()
    this.startHeartbeat()
  }

  async connect() {
    if(this.socket) {
      return
    }
    return this.connectPromise = new Promise((resolve, reject) => {
      this.resolveConnect = resolve
      this.socket = new ws(this.serverUrl, {
        ca: DEV_ROOTCA ? DEV_ROOTCA : undefined,
      })
      this.socket.on('open', () => {
        /*
          We're not setting the ready flag here,
          instead we're waiting for the application-level
          ready signal, see the system socketReady event
        */
      })
      this.socket.on('close', () => {
        this.stopHeartbeat()
        this.ready = false
      })
      this.socket.on('message', async (message) => {
        log.dev.debug(`${this.id} received ${message}`)
        try {
          const event = new ClientReceivedEvent(this, message)
          if(this.promiseResolvers.length > 0) {
            const newResolvers = []
            this.promiseResolvers.forEach((resolver) => {
              if(!resolver(event)) {
                newResolvers.push(resolver)
              } else {
                log.app.debug(`resolved ${event.kind}: ${event._message}`)
              }
            })
            this.promiseResolvers = newResolvers
          }
          this.handleEvent(event)
          this.emit('event', event)
          this.emit(`event.${event.kind}`, event)
        } catch(e) {
          log.app.error(e)
        }
      })
    })
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(this.heartbeat, this.heartbeatIntervalMillis)
    this.heartbeat()
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval)
    clearTimeout(this.heartbeatTimeout)
  }

  actorId() {
    this.requireReady()
    return this.roomData.actorId()
  }

  async disconnect() {
    this.ready = false
    return new Promise((resolve, reject) => {
      this.socket.once("close", () => {
        resolve(this)
      })
      this.socket.close()
      this.socket = null
    })
  }

  peersIncludingSelf() {
    return this.roomData.peersIncludingSelf()
  }

  authenticatedPeers() {
    return this.roomData.authenticatedPeers()
  }

  async getRoomState() {
    this.requireReady()
    const response = await this.sendEventWithPromise("getRoom", {})
    return response.data()
  }

  async getWidgetState(widgetId) {
    this.requireReady()
    const response = await this.sendEventWithPromise("getWidget", { widgetId })
    return response.data()
  }

  isReady() {
    return this.ready
  }

  isAuthenticated() {
    return this.roomData
  }

  requireReady() {
   if(!this.ready) {
      throw "Please connect"
    }
  }

  sendEvent(event) {
    const stringEvent = JSON.stringify(event)
    log.dev.info(`Sending event ${stringEvent}`)
    this.send(stringEvent)
  }

  async sendHttpPost(endpoint, data={}) {
    const authHeader = this.authToken ? `Bearer ${btoa(this.authToken)}` : ""
    const options = {
      host: lib.appInfo.apiHost(),
      port: lib.appInfo.apiPort(),
      path: endpoint,
      method: 'POST',
      ca: DEV_ROOTCA || undefined,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
    }
    let responseChunks = []
    return new Promise((resolve, reject) => {
      const request = https.request(options, (res) => {
        res.on('data', (d) => {
          responseChunks.push(d)
        })
        res.on('end', () => {
          resolve(JSON.parse(Buffer.concat(responseChunks)))
        })
        res.on('error', (e) => (reject(e)))
      })
      request.write(JSON.stringify(data))
      request.end()
    })
  }

  async logIn(token) {
    this.authToken = token
  }

  async authenticate(token, roomRoute) {
    const response = await this.sendEventWithPromise("auth", { token, roomRoute })
    if(response.kind == "error") {
      throw response
    } else {
      await this.logIn(token)
      this.roomData = new ClientRoomData(response.payload)
    }
    return response
  }

  async sendEventWithPromise(kind, payload) {
    const event = this.makeEvent(kind, payload)
    const { promise, resolver } = this.makeEventPromise(event)
    this.promiseResolvers.push(resolver)
    this.sendEvent(event)
    return promise
  }

  async broadcast(message) {
    const result = this.sendEventWithPromise("echo", { message })
    return result
  }


  disconnect() {
    this.ready = false
    this.socket.close()
  }

  /****************************************/
  /*    private                           */
  /****************************************/
  send(message) {
    this.socket.send(message)
  }

  makeEvent(kind, payload) {
    return {
      id: `${this.id}_${this.eventId++}`,
      kind: kind,
      payload: payload
    }
  }

  makeEventPromise(event) {
    let resolvePromise = null
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve
    })
    const resolver = (receivedEvent) => {
      const response = receivedEvent
      if(response.requestId == event.id) {
        resolvePromise(response)
        return true
      }
      return false
    }
    return {
      promise: promise,
      resolver: resolver
    }
  }

  handleEvent(event) {
    switch(event.kind) {
      case 'participantJoined':
        /*
          Note: we're not necessarily adding a peer when they join.
          They may have already been connected to the room,
          just not fully authenticated.

          E.g. this protects against certain race conditions:
          1. A socket connect
          2. B socket connect
          3. A authenticate
          4. B authenticate
          5. B gets list of authenticated participants: [A, B]
          6. A broadcasts its join event
         (7. B broadcasts its join event)
        */
        if(this.roomData) this.roomData.updatePeer(event.payload);
        break
      case 'participantLeft':
        if(this.roomData) this.roomData.removePeer(event.payload);
        break
      case 'system':
        if(event.payload.socketReady) {
          this.ready = true
          this.resolveConnect(this)
          this.startHeartbeat()
          this.resolveConnect = null
          this.connectPromise = null
        }
    }
  }
}

module.exports = Client
