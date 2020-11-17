const express = require('express')
const ws = require('ws')
const Participants = require("./server/participants")
const MessageProcessor = require("./server/message_processor")

class Mercury {
  constructor(port) {
    this.port = port
    this.ws = new ws.Server({ noServer: true })
    this.express = express()
    this.participants = new Participants()
    this.messageProcessor =  new MessageProcessor(this.participants)

    this.ws.on('connection', (socket) => {
      this.participants.addSocket(socket)
    })

    this.ws.on('close', () => {
      log.app.warn("socket server shut down")
    })
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.express.listen(this.port, () => {
        log.app.info(`Server live on port ${this.port}`)
        resolve()
      })
      this.server.on('upgrade', (request, socket, head) => {
        // Standard http upgrade procedure
        // https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
        this.ws.handleUpgrade(request, socket, head, (socket) => {
          this.ws.emit('connection', socket, request)
        })
      })
    })
  }

  async stop() {
    await this.participants.disconnectAll()
    return new Promise((resolve, reject) => {
      this.server.close(() => {
        log.app.info(`Server stopped.`)
        this.ws.close(() => {
          console.log("Websocket stopped")
          resolve()
        })
      })
    })
  }

  clientsCount() {
    return this.participants.count()
  }
}

module.exports = Mercury
