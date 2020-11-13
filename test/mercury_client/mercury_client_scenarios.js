const tlib = require("../lib/_testlib")
const Client = require("../../src/client/client")
const Mercury = require("../../src/mercury")

module.exports = {
  "connect_send_disconnect": async() => {
    const mercury = new Mercury(process.env.EXPRESS_PORT)
    mercury.start()
    const client = new Client(`ws://localhost:${process.env.EXPRESS_PORT}`);
    await client.connect()
    client.send("hello")
    await mercury.stop()
    return await Promise.all(tlib.util.closePromises([client]))
  },

  "1_sender_2_receivers": async (message='hello') => {
    const mercury = new Mercury(process.env.EXPRESS_PORT)
    mercury.start()
    /*
      1. Open several clients
      2. Send a message from one of them
      3. Make sure all clients except sender receive the message
    */
    const clients = [
      new Client(`ws://localhost:${process.env.EXPRESS_PORT}`),
      new Client(`ws://localhost:${process.env.EXPRESS_PORT}`),
      new Client(`ws://localhost:${process.env.EXPRESS_PORT}`),
    ]

    await Promise.all( clients.map((c) => (c.connect())) )

    const sender = clients[0]
    const sentMessage = "hello"

    const messagesReceived = []
    const receivePromises = []

    clients.forEach((client) => {

      if(client != sender) {
        receivePromises.push(new Promise((resolve, reject) => {
          client.on('message', (message) => {
            messagesReceived.push(message)
            resolve()
          })
        }))
      }

    })

    clients[0].send(sentMessage)
    await Promise.all(receivePromises)

    await mercury.stop()
    await Promise.all(tlib.util.closePromises(clients))

    return messagesReceived
  }
}
