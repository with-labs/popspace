const ws = require('ws');
let count = 0

class Client {
  constructor(serverUrl) {
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
      this.client = new ws(this.serverUrl)
      this.client.on('message', (message) => {
        log.dev.debug(`${this.id} received ${message}`)
        try {
          const event = this.parseEvent(message)
          this.promiseResolvers.forEach((resolver) => {
            resolver(event)
          })
        } catch(e) {
          // Not an event no problem, nothing to do
        }
      })
      this.client.on('open', () => {
        this.ready = true
        resolve(this)
      })
    })
  }

  parseEvent(message) {
    const event = JSON.parse(message)
    event._receiver = this
    event._message = message
    event.payload = event.payload || {}
    return event
  }

  sendEvent(event) {
    this.send(JSON.stringify(event))
  }

  async authenticate(token, roomName) {
    const response = this.sendEventWithPromise("auth", { token, roomName })
    if(response.success) {
      this.roomData = response.data
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

  /****************************************/
  /*    public - allow lower level access */
  /****************************************/
  send(message) {
    this.client.send(message)
  }

  disconnect() {
    this.client.close()
  }

  on(event, fn) {
    this.client.on(event, fn)
  }

  /****************************************/
  /*    private                           */
  /****************************************/
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
      }
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
