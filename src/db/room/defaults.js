const STANDARD_WIDGET_TYPE = [
]
const STANDARD_WIDGET_STATE = [
]
const STANDARD_WIDGET_TRANSFORM = [
]

const createStandardWidgets = async (ownerId, roomId) => {
  const result = []
  for(let i = 0; i < STANDARD_WIDGET_STATE.length; i++) {
    const widget = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({owner_id: ownerId, _type: STANDARD_WIDGET_TYPE[i]})
      const roomWidget = await tx.room_widgets.insert({widget_id: widget.id, room_id: roomId})
      return widget
    })
    const roomWidget = new shared.models.RoomWidget(
      roomId,
      widget,
      STANDARD_WIDGET_STATE[i],
      STANDARD_WIDGET_TRANSFORM[i],
      // Mock name for our default objects
      "Dorothy"
    )
    await shared.db.room.widgets.addWidgetInRoom(roomWidget)
    result.push(roomWidget)
  }
  return result
}

const getMockOwnerId = async () => {
  switch(process.env.NODE_ENV) {
    case "production":
      return 306 // Dorothy Gale
    case "staging":
      return 25
    default:
      /*
        Doesn't matter for non-production environments,
        but we can always set up more special users
      */
      return 1
  }
}

const defaults = {
  setUpDefaultRoomData: async (roomId, displayName) => {
    const standardOwnerId = await getMockOwnerId()
    const roomWidgets = await createStandardWidgets(standardOwnerId, roomId)
    return defaults.setUpDefaultRoom(roomId, displayName, roomWidgets)
  },

  setUpEmptyRoom: async (roomId, displayName) => {
    return defaults.setUpDefaultRoom(roomId, displayName, [])
  },

  setUpDefaultRoom: async (roomId, displayName, roomWidgets) => {
    /*
      Sample room state as of 2021/01/27
      {
        wallpaper_url: 'https://s3-us-west-2.amazonaws.com/with.playground/negativespave_wallpaper.png',
        is_custom_wallpaper: true,
        bounds: { width: 2400, height: 2400 },
        display_name: 'Room',
        z_order: [
          '26',   '105',  '230', '117',
          '620',  '565',  '501', '597',
          '662',  '749',  '904', '944',
          '926',  '27',   '997', '938',
          '1000', '1001', '996', '947',
          '776',  '775',  '777', '1002'
        ]
      }
    */
    const normalizedDisplayName = shared.db.room.namesAndRoutes.getNormalizedDisplayName(displayName)
    const state = {
      wallpaper_url: "https://withhq.sirv.com/external/wallpaper/onboarding/onboarding_new_3500.png",
      is_custom_wallpaper: true,
      bounds: { width: 2400, height: 2400 },
      display_name: normalizedDisplayName,
      z_order: roomWidgets.map((w) => (w.widgetId()))
    }
    await shared.db.dynamo.room.setRoomState(roomId, state)

    const roomData = {
      state,
      widgets: roomWidgets.map((w) => (w.serialize())),
      id: roomId
    }
    return roomData
  },

  getMockOwnerId
}


module.exports = defaults
