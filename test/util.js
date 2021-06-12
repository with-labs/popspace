const Hermes = require("../../src/hermes")
const Client = require("../../src/client/client")

module.exports = {
  serverWithClients: async (clientCount, heartbeatTimeoutMillis=process.env.HEARTBEAT_TIMEOUT_MILLIS) => {
    const hermes = new Hermes(process.env.TEST_PORT, heartbeatTimeoutMillis)
    try {
      await hermes.start()
    } catch(e) {
      console.log("--- Error starting hermes ---")
      console.log(e)
      return
    }
    const clients = await tlib.util.addClients(hermes, clientCount)
    return { clients, hermes }
  },

  addClients: async (hermes, clientCount, heartbeatIntervalMillis=30000, heartbeatTimeoutMillis=60000) => {
    const clients = []
    for(let i = 0; i < clientCount; i++) {
      clients.push(new Client(`wss://localhost:${process.env.TEST_PORT}`, heartbeatIntervalMillis, heartbeatTimeoutMillis))
    }
    await Promise.all( clients.map((c) => (c.connect())) )
    return clients
  }
}
