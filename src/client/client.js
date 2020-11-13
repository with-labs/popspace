const ws = require('ws');
let count = 0

class Client {
  constructor(serverUrl) {
    this.id = count++
    this.ready = false
    this.serverUrl = serverUrl
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client = new ws(this.serverUrl)
      this.client.on('message', (message) => {
      })
      this.client.on('open', () => {
        this.ready = true
        resolve(this)
      })
    })
  }

  send(message) {
    this.client.send(message)
  }

  disconnect() {
    this.client.close()
  }

  on(event, fn) {
    this.client.on(event, fn)
  }
}

module.exports = Client
