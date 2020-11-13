const tlib = require("../lib/_testlib")
const Client = require("../../src/client/client")
const Mercury = require("../../src/mercury")

const begin = async (clientCount) => {
  const mercury = new Mercury(process.env.EXPRESS_PORT)
  mercury.start()
  const clients = []
  for(let i = 0; i < clientCount; i++) {
    clients.push(new Client(`ws://localhost:${process.env.EXPRESS_PORT}`))
  }
  await Promise.all( clients.map((c) => (c.connect())) )
  return { clients, mercury }
}

const finish = async (mercury, clients) => {
  await mercury.stop()
  return await Promise.all(tlib.util.closePromises(clients))
}

module.exports = {
  "connect_send_disconnect": async() => {
    const { clients, mercury } = await begin(1)
    clients[0].send("hello")
    return await finish(mercury, clients)
  },

  "1_sender_2_receivers": async (message='hello') => {
    /*
      1. Open several clients
      2. Send a message from one of them
      3. Make sure all clients except sender receive the message
    */
    const { clients, mercury } = await begin(3)

    const sender = clients[0]
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

    sender.send(message)
    await Promise.all(receivePromises)
    await finish(mercury, clients)
    return messagesReceived
  },

  "2_peers_back_and_forth": async (messageList1=["hello", "1"], messageList2=["goodbye", "2"]) => {
    const { clients, mercury } = await begin(2)

    const messagesReceived1 = []
    const messagesReceived2 = []
    const sequence = []

    await new Promise((resolve, reject) => {
      clients[0].on('message', (message) => {
        messagesReceived1.push(message)
        sequence.push(message)
        if(messageList1.length > 0) {
          clients[0].send(messageList1.shift())
        } else {
          resolve()
        }
      })

      clients[1].on('message', (message) => {
        messagesReceived2.push(message)
        sequence.push(message)
        if(messageList2.length > 0) {
          clients[1].send(messageList2.shift())
        } else {
          resolve()
        }
      })

      clients[0].send(messageList1.shift())
    })

    await finish(mercury, clients)

    return {
      received1: messagesReceived1,
      received2: messagesReceived2,
      sequence: sequence
    }





  }
}
