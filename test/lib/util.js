const Mercury = require("../../src/mercury")
const Client = require("../../src/client/client")

module.exports = {
  serverWithClients: async (clientCount) => {
    const mercury = new Mercury(process.env.TEST_PORT)
    try {
      await mercury.start()
    } catch(e) {
      console.log("--- Error staring mercury ---")
      console.log(e)
      return
    }
    const clients = await tlib.util.addClients(mercury, clientCount)
    return { clients, mercury }
  },

  addClients: async (mercury, clientCount) => {
    const clients = []
    for(let i = 0; i < clientCount; i++) {
      clients.push(new Client(`wss://localhost:${process.env.TEST_PORT}`))
    }
    await Promise.all( clients.map((c) => (c.connect())) )
    return clients
  }
}
