const Mercury = require("../../src/mercury")
const Client = require("../../src/client/client")

module.exports = {
  serverWithClients: async (clientCount, tag) => {
    console.log("BEGINNING", tag)
    const mercury = new Mercury(process.env.TEST_PORT)
    console.log("CREATED MERCURY", tag)
    try {
      await mercury.start()
    } catch(e) {
      console.log(e)
      return
    }

    console.log("MERCURY STARTED", tag)
    const clients = []
    for(let i = 0; i < clientCount; i++) {
      clients.push(new Client(`ws://localhost:${process.env.TEST_PORT}`))
    }
    console.log("CLIENT INITIALIZED", tag)
    await Promise.all( clients.map((c) => (c.connect())) )
    console.log("CLIENTS CONNECTED", tag)
    return { clients, mercury }
  }
}
