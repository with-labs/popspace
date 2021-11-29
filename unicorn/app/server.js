const express = require('express')
const next = require('next')
const ExpressNextRouter = require("./api/express_next_router.js")
const Middleware = require("./middleware.js")
const fs = require('fs')

const WsDocumentServer = require("./ws/ws_document_server.js")

const useSsl = !!process.env.SSL_PRIVATE_KEY_PATH && !!process.env.SSL_CERTIFICATE_PATH
class Server {
  constructor(port, dev = process.env.NODE_ENV !== 'production', test = process.env.NODE_ENV === 'test') {
    this.port = port
    this.express = express()
    this.next = next({ dev: dev && !test })
    this.router = new ExpressNextRouter(this.express, this.next)
    this.middleware = new Middleware(this.express)
  }

  async start() {
    if (useSsl) {
      this.server = require('https').createServer({
        key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')
      }, express)
    } else {
      this.server = require('http').createServer(this.express)
    }
    await this.next.prepare()
    await this.router.init()
    await this.initDocumentSync(this.server)
    return new Promise((resolve) => {
      this.server.listen(process.env.UNICORN_PORT, resolve);
    });
  }

  stop() {
    this.server.close();
  }

  async initDocumentSync(server) {
    this.wsDocumentServer = new WsDocumentServer()
    await this.wsDocumentServer.connect(server)
  }
}

module.exports = Server
