global.tlib = require("../../../lib/_testlib")
const Client = require("../../../../src/client/client")

module.exports = {
  "connect_send_disconnect": tlib.TestTemplate.testServerClients(1, async (clients) => {
    clients[0].broadcast("hello")
    return true
  }),

  "heartbeat_timeout_disconnect": tlib.TestTemplate.testServerClients(1, async (clients, mercury) => {
    const heartbeatIntervalMillis = 60000
    const heartbeatTimeoutMillis = 100
    const client = new Client(`wss://localhost:${process.env.TEST_PORT}`, heartbeatIntervalMillis, heartbeatTimeoutMillis)
    await client.connect()
    const readyBeforeTimeout = client.isReady()
    const clientsBeforeTimeout = mercury.clientsCount()
    await new Promise((resolve, reject) => setTimeout(resolve, heartbeatTimeoutMillis * 2))
    const clientsAfterTimeout = mercury.clientsCount()
    const readyAfterTimeout = client.isReady()
    return {
      clientsBeforeTimeout,
      clientsAfterTimeout,
      readyBeforeTimeout,
      readyAfterTimeout
    }
  }),

  "heartbeat_timeout_event_propagate": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const existingClient = testEnvironment.loggedInUsers[0].client
    const mercury = testEnvironment.mercury
    let leaveEvent
    const leaveEventPromise = new Promise((resolve, reject) => {
      existingClient.on('event.participantLeft', (event) => {
        leaveEvent = event
        resolve()
      })
    })

    const room = testEnvironment.loggedInUsers[0].room
    const roomNameEntry = testEnvironment.loggedInUsers[0].roomNameEntry

    const heartbeatIntervalMillis = 60000
    // NOTE: setting this to a lower number reveals certain bugs that we may encounter at scale
    const heartbeatTimeoutMillis = 1500
    const clients = await tlib.util.addClients(testEnvironment.mercury, 1, heartbeatIntervalMillis, heartbeatTimeoutMillis)
    const client = clients[0]

    const environmentUser = await testEnvironment.createLoggedInUser(client, room, roomNameEntry)
    await testEnvironment.authenticate(environmentUser)

    const readyBeforeTimeout = client.isReady()
    const clientsBeforeTimeout = mercury.clientsCount()
    await new Promise((resolve, reject) => setTimeout(resolve, heartbeatTimeoutMillis * 2))
    const clientsAfterTimeout = mercury.clientsCount()
    const readyAfterTimeout = client.isReady()
    await leaveEventPromise
    return {
      clientsBeforeTimeout,
      clientsAfterTimeout,
      readyBeforeTimeout,
      readyAfterTimeout,
      leaveEvent: leaveEvent.data()
    }
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
          loggedInUser.client.on('event.echo', (event) => {
            messagesReceived.push(event.payload.message)
            resolve()
          })
        }))
      }
    })
    sender.broadcast(sentMessage)
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
      clients[0].on('event.echo', (event) => {
        messagesReceived1.push(event.payload.message)
        sequence.push(event.payload.message)
        if(messageList1.length > 0) {
          clients[0].broadcast(messageList1.shift())
        } else {
          resolve()
        }
      })

      clients[1].on('event.echo', (event) => {
        messagesReceived2.push(event.payload.message)
        sequence.push(event.payload.message)
        if(messageList2.length > 0) {
          clients[1].broadcast(messageList2.shift())
        } else {
          resolve()
        }
      })

      clients[0].broadcast(messageList1.shift())
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
