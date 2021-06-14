require("../src/globals")
const Server = require("../src/server")
const fs = require("fs")

class Template {
  constructor() {
    this.certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')
  }

  serverClient(lambda) {
    return this.serverClients(1, (server, clients) => {
      return lambda(server, clients[0])
    })
  }

  serverClients(nClients, lambda) {
    return async () => {
      const server = new Server(process.env.EXPRESS_PORT_TEST)
      await server.start()
      let result
      try {
        const clientPromises = []
        for(let i = 0; i < nClients; i++) {
          clientPromises.push(this.httpClient())
        }

        const clients = await Promise.all(clientPromises)
        result = await lambda(server, clients)
      } catch(e) {
        throw(e)
      } finally {
        await server.stop()
      }
      return result
    }
  }

  async httpClient() {
    const host = lib.appInfo.apiHost()
    const port = lib.appInfo.apiPort()
    const client = await shared.test.clients.HttpClient.anyLoggedInOrCreate(host, this.certificate, port)
    return client
  }
}

module.exports = new Template()
