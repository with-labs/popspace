const ws = require('ws');
const EventEmitter = require('events');
let count = 0
const ClientRoomData = require('./client_room_data')

class Client extends EventEmitter {
  constructor(serverUrl) {
    super()
    this.id = count++
    this.eventId = 0
    this.ready = false
    this.serverUrl = serverUrl
    this.messageListeners = {}
    this.promiseResolvers = []
  }

  /**********************************/
  /* API: usually use these methods */
  /**********************************/
  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new ws(this.serverUrl, {
        rejectUnauthorized: process.env.NODE_ENV == 'production'
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
      this.socket.on('open', () => {
        this.ready = true
        resolve(this)
      })
    })
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

  async authenticate(token, roomName) {
    const response = await this.sendEventWithPromise("auth", { token, roomName })
    if(response.kind == "error") {
      throw response
    } else {
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
    return this.sendEventWithPromise("echo", { message })
  }


  disconnect() {
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
