const Mercury = require("../../src/mercury")
const Client = require("../../src/client/client")

module.exports = {
  serverWithClients: async (clientCount) => {
    const mercury = new Mercury(process.env.TEST_PORT)
    try {
      await mercury.start()
    } catch(e) {
      console.log(e)
      return
    }

    const clients = []
    for(let i = 0; i < clientCount; i++) {
      clients.push(new Client(`ws://localhost:${process.env.TEST_PORT}`))
    }
    await Promise.all( clients.map((c) => (c.connect())) )
    return { clients, mercury }
  }
}
