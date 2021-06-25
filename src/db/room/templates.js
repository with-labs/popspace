const MOCK_USER_ID = -5000
let mockCreator

const getMockCreator = async () => {
  if(mockCreator) {
    return mockCreator
  }
  mockCreator = await shared.db.accounts.actorById(MOCK_USER_ID)
  if(!mockCreator) {
    log.app.info(`Creating mock actor with id ${MOCK_USER_ID} for creating widgets in room templates.`)
    mockCreator = await shared.db.pg.massive.actors.insert({
      id: MOCK_USER_ID,
      kind: "system",
      display_name: "Tilde"
    })
    log.app.info("Successfully created mock widget creator!", mockCreator)
  }
  return mockCreator
}

/**
 * @typedef {Object} RoomState
 * @property {string} display_name
 * @property {string} wallpaper_url
 * @property {boolean} is_custom_wallpaper
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} TemplateData
 * @property {RoomState} state
 * @property {Array} widgets - A tuple of [WidgetType, WidgetState, Transform]
 */

module.exports = {
  /**
   *
   * @param {number} roomId
   * @param {TemplateData} templateData
   */
  setUpRoomFromTemplate: async (roomId, templateData) => {
    const creator = await getMockCreator()
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
    const state = {
      ...templateData.state,
      z_order: [],
    }
    await shared.db.room.data.setRoomState(roomId, state)

    // add widgets
    const widgets = []
    for (const [type, widgetState, transform] of templateData.widgets) {
      const roomWidget = await shared.db.room.data.addWidgetInRoom(creator.id, roomId, type, widgetState, transform, creator)
      widgets.push(roomWidget)
    }

    return {
      state,
      widgets: (await Promise.all(widgets.map((w) => w.serialize()))),
      id: roomId,
    }
  },

  empty: (displayName="generated") => {
    return {
      state: {display_name: displayName},
      widgets: []
    }
  },

}
