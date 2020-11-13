const tlib = require("../lib/_testlib")
const Client = require("../../src/client/client")
const Mercury = require("../../src/mercury")

module.exports = {
  "keep_track_of_clients": async(numberOfConnections=2) => {
    const mercury = new Mercury(process.env.EXPRESS_PORT)
    mercury.start()

    const clients = [
      new Client(`ws://localhost:${process.env.EXPRESS_PORT}`),
      new Client(`ws://localhost:${process.env.EXPRESS_PORT}`)
    ]
    await Promise.all( clients.map((c) => (c.connect())) )

    const connectedClients = mercury.clientsCount()
    await mercury.stop()

    await Promise.all(tlib.util.closePromises(clients))

    return {
      clientsCountOnServer: connectedClients,
      clientsCreated: numberOfConnections
    }
  }
}
