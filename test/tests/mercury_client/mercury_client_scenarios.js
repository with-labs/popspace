global.tlib = require("../../lib/_testlib")

module.exports = {
  "connect_send_disconnect": tlib.TestTemplate.testServerClients(1, async (clients) => {
    clients[0].send("hello")
    return true
  }),

  "1_sender_2_receivers": tlib.TestTemplate.nAuthenticatedUsers(3, async (testEnvironment) => {
    const loggedInUsers = testEnvironment.loggedInUsers
    const sentMessage = 'hello'
    const sender = loggedInUsers[0].client
    const messagesReceived = []
    const receivePromises = []

    loggedInUsers.forEach((loggedInUser) => {
      if(loggedInUser.client != sender) {
        receivePromises.push(new Promise((resolve, reject) => {
          loggedInUser.client.on('message', (message) => {
            messagesReceived.push(message)
            resolve()
          })
        }))
      }
    })
    sender.send(sentMessage)
    await Promise.all(receivePromises)
    return {
      sentMessage,
      messagesReceived
    }
  }),

  "2_peers_back_and_forth": tlib.TestTemplate.nAuthenticatedUsers(2, async (testEnvironment) => {
    const messageList1 = ["hello", "msg1", "hi", "msg3"]
    const messageList2 = ["goodbye", "msg2", "bye", "msg4"]

    const messagesSent1 = [...messageList1]
    const messagesSent2 = [...messageList2]

    const messagesReceived1 = []
    const messagesReceived2 = []
    const sequence = []
    const clients = testEnvironment.loggedInUsers.map((u) => (u.client))

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

    return {
      messagesSent1,
      messagesSent2,
      messagesReceived1,
      messagesReceived2,
      sequence
    }

  })
}
