const Hermes = require("../src/hermes")
const Client = require("../src/client/client")

const testUtils = {
  server: async (heartbeatTimeoutMillis=process.env.HEARTBEAT_TIMEOUT_MILLIS) => {
    const hermes = new Hermes(process.env.TEST_PORT, heartbeatTimeoutMillis)
    try {
      await hermes.start()
    } catch(e) {
      console.log("--- Error starting hermes ---")
      console.log(e)
      return
    }
    return hermes
  },

  serverWithClients: async (clientCount, heartbeatTimeoutMillis=process.env.HEARTBEAT_TIMEOUT_MILLIS) => {
    const hermes = await testUtils.server(heartbeatTimeoutMillis)
    const clients = await lib.test.util.addClients(clientCount)
    return { clients, hermes }
  },

  addClients: async (clientCount, heartbeatIntervalMillis=30000, heartbeatTimeoutMillis=60000) => {
    const clients = []
    for(let i = 0; i < clientCount; i++) {
      clients.push(new Client(`wss://localhost:${process.env.TEST_PORT}`, heartbeatIntervalMillis, heartbeatTimeoutMillis))
    }
    await Promise.all( clients.map((c) => (c.connect())) )
    return clients
  }
}


module.exports = testUtils
