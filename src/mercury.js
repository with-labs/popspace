const express = require('express')
const ws = require('ws')
const Participants = require("./server/participants")
const EventProcessor = require("./server/event_processor")

const setupSslCertificate = (server) => {
  if(process.env.NODE_ENV == "staging") {
    server.get("/.well-known/acme-challenge/qDXrOCjH5Lq9rJiNAXHlbtpq7r1PjGTEMUWDFZFGiqE", (req, res) => {
      res.send("E-MYqRgt4XNcoZd7PshjMnf00WF4yrNUUwhfo0WKiZs.2em07c7jo9IgJDEa63fu1Ts4rs8OQFcZRLF3jJZ21fg")
    })
  }
  server.get("/ping", (req, res) => {
    res.send("pong")
  })
}

class Mercury {
  constructor(port) {
    this.port = port
    this.ws = new ws.Server({ noServer: true })
    this.express = express()
    this.participants = new Participants()
    this.eventProcessor =  new EventProcessor(this.participants)

    this.ws.on('connection', (socket) => {
      this.participants.addSocket(socket)
    })

    this.ws.on('close', () => {
      log.app.warn("socket server shut down")
    })
  }

  async start() {
    setupSslCertificate(this.express)
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
          log.app.info(`WebSocket stopped.`)
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
