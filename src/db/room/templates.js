const { getMockCreatorId } = require("./defaults")

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
    const creatorId = await getMockCreatorId()

    const state = {
      ...templateData.state,
      z_order: [],
    }
    await shared.db.room.data.setRoomState(roomId, state)

    // add widgets
    const widgets = []
    for (const [type, widgetState, transform] of templateData.widgets) {
      const roomWidget = await shared.db.room.data.addWidgetInRoom(creatorId, roomId, type, widgetState, transform)
      await shared.db.room.data.addWidgetInRoom(roomWidget)
      widgets.push(roomWidget)
    }

    return {
      state,
      widgets: widgets.map((w) => w.serialize()),
      id: roomId,
    }
  },
}
