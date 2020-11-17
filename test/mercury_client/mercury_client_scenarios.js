const tlib = require("../lib/_testlib")

module.exports = {
  "connect_send_disconnect": async () => {
    console.log("CONNECt-DISCONNECT")
    const { clients, mercury } = await tlib.util.serverWithClients(1, "CONNECt-DISCONNECT")
    console.log("BEGUN")
    clients[0].send("hello")
    console.log("SENT")
    return await mercury.stop()
  },

  "1_sender_2_receivers": async (message='hello') => {
    console.log("1 sender 2 receivers")
    /*
      1. Open several clients
      2. Send a message from one of them
      3. Make sure all clients except sender receive the message
    */
    const { clients, mercury } = await tlib.util.serverWithClients(3, "1_sender_2_receivers")

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
    await mercury.stop()
    return messagesReceived
  },

  "2_peers_back_and_forth": async (messageList1=["hello", "1"], messageList2=["goodbye", "2"]) => {
    const { clients, mercury } = await tlib.util.serverWithClients(2)

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

    await mercury.stop()

    return {
      received1: messagesReceived1,
      received2: messagesReceived2,
      sequence: sequence
    }

  }
}
