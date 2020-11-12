const express = require('express')
const ws = require('ws')

class Mercury {
  constructor(port) {
    this.port = port
    this.ws = new ws.Server({ noServer: true })
    this.express = express()

    // https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
    this.express.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request)
      })
    })

    this.ws.on('connection', socket => {
      socket.on('message', message => console.log(message));
    });
  }

  start() {
    this.express.listen(this.port)
  }
}

module.exports = Mercury
