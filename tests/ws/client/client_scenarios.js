module.exports = {
  "connect_send_disconnect": lib.test.template.testServerClients(1, async (clients) => {
    clients[0].broadcast("hello")
    return true
  }),

  "heartbeat_timeout_disconnect": lib.test.template.testServerClients(1, async (clients, hermes) => {
    const heartbeatIntervalMillis = 60000
    const heartbeatTimeoutMillis = 100
    const client = new lib.Client(`wss://localhost:${process.env.TEST_PORT}`, heartbeatIntervalMillis, heartbeatTimeoutMillis)
    await client.connect()
    const readyBeforeTimeout = client.isReady()
    const clientsBeforeTimeout = hermes.clientsCount()
    await new Promise((resolve, reject) => setTimeout(resolve, heartbeatTimeoutMillis * 2))
    const clientsAfterTimeout = hermes.clientsCount()
    const readyAfterTimeout = client.isReady()
    return {
      clientsBeforeTimeout,
      clientsAfterTimeout,
      readyBeforeTimeout,
      readyAfterTimeout
    }
  }),

  "heartbeat_timeout_event_propagate": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const existingClient = testEnvironment.loggedInActors[0].client
    const hermes = testEnvironment.hermes
    let leaveEvent
    const leaveEventPromise = new Promise((resolve, reject) => {
      existingClient.on('event.participantLeft', (event) => {
        leaveEvent = event
        resolve()
      })
    })

    const room = testEnvironment.loggedInActors[0].room

    const heartbeatIntervalMillis = 60000
    // NOTE: setting this to a lower number reveals certain bugs that we may encounter at scale
    const heartbeatTimeoutMillis = 1500
    const clients = await lib.test.util.addClients(1, heartbeatIntervalMillis, heartbeatTimeoutMillis)
    const client = clients[0]

    const environmentActor = await testEnvironment.createLoggedInActor(client, room)
    await testEnvironment.authenticate(environmentActor)

    const readyBeforeTimeout = client.isReady()
    const clientsBeforeTimeout = hermes.clientsCount()
    await new Promise((resolve, reject) => setTimeout(resolve, heartbeatTimeoutMillis * 2))
    const clientsAfterTimeout = hermes.clientsCount()
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

  "1_sender_2_receivers": lib.test.template.nAuthenticatedActors(3, async (testEnvironment) => {
    const loggedInActors = testEnvironment.loggedInActors
    const sentMessage = 'hello'
    const sender = loggedInActors[0].client
    const messagesReceived = []
    const receivePromises = []

    loggedInActors.forEach((loggedInActor) => {
      if(loggedInActor.client != sender) {
        receivePromises.push(new Promise((resolve, reject) => {
          loggedInActor.client.on('event.echo', (event) => {
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

  "2_peers_back_and_forth": lib.test.template.nAuthenticatedActors(2, async (testEnvironment) => {
    const messageList1 = ["hello", "msg1", "hi", "msg3"]
    const messageList2 = ["goodbye", "msg2", "bye", "msg4"]

    const messagesSent1 = [...messageList1]
    const messagesSent2 = [...messageList2]

    const messagesReceived1 = []
    const messagesReceived2 = []
    const sequence = []
    const clients = testEnvironment.loggedInActors.map((u) => (u.client))

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
