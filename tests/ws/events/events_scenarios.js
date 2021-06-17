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

const getOrCreateWidget = async (client, roomData) => {
   const widgetsInRoom = roomData.widgets
    if(widgetsInRoom.length < 1) {
      const createData = await requestStickyNoteCreate(client)
      return createData.payload
    } else {
      return widgetsInRoom[0]
    }
}

module.exports = {
  "authenticate": lib.test.template.unauthenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client

    await client.connect()

    const beforeAuth = await requestStickyNoteCreate(client)
    const auth = await host.join()
    const afterAuth = await requestStickyNoteCreate(client)
    return {
      beforeAuth: beforeAuth,
      auth: auth.data(),
      afterAuth: afterAuth
    }
  }),

  "authenticate_fail_wrong_token": lib.test.template.unauthenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    let response = null
    try {
      await client.connect()
      response = (await client.authenticate("{}", host.room.url_id)).data()
    } catch(e) {
      response = e
    }

    const afterAuthCreateWidgetResponse = await requestStickyNoteCreate(client)
    return {
      auth: response,
      afterAuth: afterAuthCreateWidgetResponse
    }
  }),

  "authenticate_fail_no_such_room": lib.test.template.unauthenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    let response = null
    try {
      await client.connect()
      response = (await client.authenticate("{}", null)).data()
    } catch(e) {
      response = e
    }

    const afterAuthCreateWidgetResponse = await requestStickyNoteCreate(client)
    return {
      auth: response,
      afterAuth: afterAuthCreateWidgetResponse
    }
  }),

  "create_a_widget": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    const startRoomData = host.auth.payload.roomData

    const createData = await requestStickyNoteCreate(client)
    const endRoomState = await client.getRoomState()
    return {
      createResponse: createData,
      beginWidgetCount: startRoomData.widgets.length,
      endWidgetCount: endRoomState.payload.widgets.length
    }
  }),

  "move_a_widget": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    const roomData = host.auth.payload.roomData

    const widget = await getOrCreateWidget(client, roomData)
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
    await client.sendEventWithPromise("transformWidget", move)
    const newState = await client.getWidgetState(widget.widgetId)

    return {
      beforeMove,
      afterMove: newState.payload
    }
  }),

  "update_wallpaper": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    const startRoomData = host.auth.payload.roomData
    const updateResponse = await client.sendEventWithPromise("updateRoomState", {
      wallpaperUrl: "https://s3-us-west-2.amazonaws.com/with.wallpapers/To-Do_Board_Galaxy.jpg"
    })
    const newRoomState = await client.getRoomState()
    return {
      startRoomData: startRoomData,
      updateResponse: updateResponse.data(),
      newRoomState
    }
  }),

  "create_then_delete": lib.test.template.authenticatedActor(async (testEnvironment) => {
    const host = testEnvironment.getHost()
    const client = host.client
    const startRoomData = host.auth.payload.roomData

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
    const host = testEnvironment.getHost()
    const sender = host.client
    const startRoomData = host.auth.payload.roomData

    const event = sender.makeEvent("passthrough", {payload: {anything: "canGoHere"}})
    const received = []
    const receivals = new Promise((resolve, reject) => {
      const receivers = testEnvironment
        .allExceptHost()
        .map((loggedInActor) => (loggedInActor.client))
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
