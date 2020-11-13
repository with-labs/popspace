const express = require('express')
const ws = require('ws')
const Participants = require("./server/participants")

// Mercury is the god of communication
class Mercury {
  constructor(port) {
    this.port = port
    this.ws = new ws.Server({ noServer: true })
    this.express = express()
    this.participants = new Participants()
    this.participants.setMessageHandler((participant, message) => {
      console.log(`Received ${message}`)
      this.participants.broadcastFrom(participant, message)
    })

    this.ws.on('connection', (socket) => {
      this.participants.addSocket(socket)
    })

    this.ws.on('close', () => {
      console.log("close")
    })
  }

  start() {
    // console.log(`Server live on port ${this.port}`)
    this.server = this.express.listen(this.port)
    this.server.on('upgrade', (request, socket, head) => {
      // Standard http upgrade procedure
      // https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
      this.ws.handleUpgrade(request, socket, head, (socket) => {
        this.ws.emit('connection', socket, request)
      })
    })

  }

  async stop() {

    this.participants.disconnectAll()
    return new Promise((resolve, reject) => {
      this.server.close(() => {
        // console.log("Server shut down")
        resolve()
      })
    })

  }

  clientsCount() {
    return this.participants.count()
  }
}

module.exports = Mercury
