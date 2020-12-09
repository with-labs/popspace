const ws = require('ws');
const EventEmitter = require('events');
let count = 0

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
      this.socket = new ws(this.serverUrl)
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

  async getRoomState() {
    this.requireReady()
    return this.sendEventWithPromise("room/getRoom", {})
  }

  async getWidgetState(widgetId) {
    this.requireReady()
    return this.sendEventWithPromise("room/getWidget", { widget_id: widgetId })
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
      throw {response: response, code: response.code, message: `Error ${response.code}: ${response.message}`}
    } else {
      this.roomData = response.payload
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

  }
}

module.exports = Client
