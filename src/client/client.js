const ws = require('ws');
const EventEmitter = require('events');
let count = 0
const ClientRoomData = require('./client_room_data')
const https = require('https')
const btoa = require('btoa')
const fs = require('fs')

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
  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new ws(this.serverUrl, {
        rejectUnauthorized: lib.app.isProduction()
      })
      this.socket.on('open', () => {
        this.startHeartbeat()
        this.ready = true
        resolve(this)
      })
      this.socket.on('close', () => {
        this.stopHeartbeat()
        this.ready = false
      })
      this.socket.on('message', (message) => {
        log.dev.debug(`${this.id} received ${message}`)
        try {
          const event = this.parseEvent(message)
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
          // Not an event no problem, nothing to do
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

  userId() {
    this.requireReady()
    return this.roomData.userId()
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
    return this.sendEventWithPromise("getRoom", {})
  }

  async getWidgetState(widgetId) {
    this.requireReady()
    return this.sendEventWithPromise("getWidget", { widget_id: widgetId })
  }

  isReady() {
    return this.ready
  }

  requireReady() {
   if(!this.ready) {
      throw "Please connect"
    }
  }

  parseEvent(message) {
    const event = JSON.parse(message)
    event._receiver = this
    event._message = message
    return event
  }

  sendEvent(event) {
    this.send(JSON.stringify(event))
  }

  async sendHttpPost(endpoint, data={}) {
    const authHeader = this.authToken ? `Bearer ${btoa(this.authToken)}` : ""
    const options = {
      host: lib.app.apiHost(),
      port: lib.app.apiPort(),
      path: endpoint,
      method: 'POST',
      rejectUnauthorized: lib.app.isProduction(),
      ca: [fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')],
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

  async authenticate(token, roomName) {
    const response = await this.sendEventWithPromise("auth", { token, roomName })
    if(response.kind == "error") {
      throw response
    } else {
      this.roomData = new ClientRoomData(response.payload)
    }
    this.authToken = token
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
    return this.sendEventWithPromise("echo", { message })
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
      if(receivedEvent.requestId == event.id) {
        resolvePromise(receivedEvent)
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
        this.roomData.updatePeer(event.payload)
        break
      case 'participantLeft':
        this.roomData.removePeer(event.payload)
        break
    }
  }
}

module.exports = Client
