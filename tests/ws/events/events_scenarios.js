const requestStickyNoteCreate = async (client) => {
  const response = await client.sendEventWithPromise("createWidget", {
    type: "sticky_note",
    transform: {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100},
    },
    widgetState: {
      text: "Hello world!"
    }
  })
  return response.data()
}

const getOrCreateWidget = async (client, authData) => {
   const widgetsInRoom = authData.room.widgets
    if(widgetsInRoom.length < 1) {
      const createData = await requestStickyNoteCreate(client)
      return createData.payload
    } else {
      return widgetsInRoom[0]
    }
}

module.exports = {
  "authenticate": lib.test.template.testServerClients(1, async (clients) => {
    const testEnvironment = new lib.test.TestEnvironment()
    const { actor, session, token, room } = await testEnvironment.createLoggedInActor()
    const beforeAuth = await clients[0].sendEventWithPromise("createWidget", {})
    const auth = await clients[0].authenticate(token, room)
    const afterAuth = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      beforeAuth: beforeAuth.data(),
      auth: auth.data(),
      afterAuth: afterAuth.data()
    }
  }),

  "authenticate_fail_wrong_token": lib.test.template.testServerClients(1, async (clients) => {
    const testEnvironment = new lib.test.TestEnvironment()
    const { actor, session, token, room } = await testEnvironment.createLoggedInActor()
    let response = null
    try {
      response = await clients[0].authenticate("{}", room)
    } catch(e) {
      response = e
    }

    const afterAuthCreateWidgetResponse = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      auth: response.data(),
      afterAuth: afterAuthCreateWidgetResponse.data()
    }
  }),

  "authenticate_fail_no_such_room": lib.test.template.testServerClients(1, async (clients) => {
    const testEnvironment = new lib.test.TestEnvironment()
    let response = null
    try {
      response = await clients[0].authenticate("{}", null)
    } catch(e) {
      response = e
    }
    const afterAuthCreateWidgetResponse = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      auth: response.data(),
      afterAuth: afterAuthCreateWidgetResponse.data()
    }
  }),

  "create_a_widget": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const client = testEnvironment.loggedInActors[0].client
    const startRoomData = testEnvironment.loggedInActors[0].auth.payload.room
    const createData = await requestStickyNoteCreate(client)
    const endRoomState = await client.getRoomState()
    return {
      createResponse: createData,
      beginWidgetCount: startRoomData.widgets.length,
      endWidgetCount: endRoomState.payload.widgets.length
    }
  }),

  "move_a_widget": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const client = testEnvironment.loggedInActors[0].client
    const auth = testEnvironment.loggedInActors[0].auth
    const widget = await getOrCreateWidget(client, auth.payload)
    const beforeMove = Object.assign({}, widget)

    const move = {
      widgetId: widget.widgetId,
      transform: {
        position: {
          x: parseInt(beforeMove.transform.position.x) + 30,
          y: parseInt(beforeMove.transform.position.y) + 60
        }
      }
    }
    await client.sendEventWithPromise("moveWidget", move)
    const newState = await client.getWidgetState(widget.widgetId)

    return {
      beforeMove,
      afterMove: newState.payload
    }
  }),

  "update_wallpaper": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const client = testEnvironment.loggedInActors[0].client
    const startRoomData = testEnvironment.loggedInActors[0].auth.payload.room
    const updateResponse = await client.sendEventWithPromise("updateRoomState", {
      wallpaperUrl: "https://s3-us-west-2.amazonaws.com/with.wallpapers/To-Do_Board_Galaxy.jpg"
    })
    const newRoomState = await client.getRoomState()
    return {
      updateResponse: updateResponse.data(),
      newRoomState
    }
  }),

  "create_then_delete": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const client = testEnvironment.loggedInActors[0].client
    const startRoomData = testEnvironment.loggedInActors[0].auth.payload.room

    const createData = await requestStickyNoteCreate(client)
    const widgetId = createData.payload.widgetId
    const roomStateAfterCreate = await client.getRoomState()
    const deleteResponse = await client.sendEventWithPromise("deleteWidget", {widgetId})
    const roomStateAfterDelete = await client.getRoomState()

    return {
      createResponse: createData,
      deleteResponse: deleteResponse.data(),
      roomStateAfterCreate,
      roomStateAfterDelete
    }
  }),

  "passthrough": lib.test.template.nAuthenticatedActors(3, async (testEnvironment) => {
    const sender = testEnvironment.loggedInActors[0].client
    const event = sender.makeEvent("passthrough", {payload: {anything: "canGoHere"}})
    const received = []
    const receivals = new Promise((resolve, reject) => {
      const receivers = testEnvironment
        .loggedInActors
        .map((loggedInActor) => (loggedInActor.client))
        .splice(1)
      let remaining = receivers.length
      receivers.forEach((receiver) => {
        receiver.on("event.passthrough", (event) => {
          received.push(event.data())
          remaining--
          if(remaining <= 0) {
            resolve()
          }
        })
      })
    })
    // No response for passthrough events
    await sender.sendEvent(event)
    await receivals

    return {
      sentEvent: event,
      receivedEvents: received
    }
  })
}
