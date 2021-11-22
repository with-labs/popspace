const fs = require('fs')
const express = require('express')
const https = require('https')
const http = require('http')

const useSsl = !!process.env.SSL_PRIVATE_KEY_PATH

const loadSsl = () => {
  const privateKey  = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8')
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')
  log.app.info(`Loaded SSL certificate from ${process.env.SSL_CERTIFICATE_PATH}`)
  return { key: privateKey, cert: certificate }
}

class Server {
  constructor(port) {
    this.port = port
    this.express = express()
    this.api = new api.NoodleApi(this.express)
  }

  getExpress() {
    return this.express
  }

  async start() {
    return new Promise((resolve, reject) => {
      if (useSsl) {
        this.server = https.createServer(loadSsl(), this.express)
      } else {
        this.server = http.createServer(this.express)
      }
      this.listen = this.server.listen(this.port, () => {
        log.app.info(`Server live on port ${this.port}`)
        resolve()
      })
    })
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.server.close(() => {
        log.app.info(`Server stopped.`)
        resolve()
      })
    })
  }

}

module.exports = Server
