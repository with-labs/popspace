const RoomDynamo = require("./room_data/room_dynamo")

class RoomData {
  constructor() {
    this.dynamo = new RoomDynamo()
  }

  async init() {
    await this.dynamo.init()
  }

  async getRoomData(roomId) {
    const room = {}
    const widgetsInRoom = await this.getWidgetsInRoom(roomId)
    room.widgets = widgetsInRoom.map((w) => (w.serialize()))
    room.id = roomId
    room.state = await this.dynamo.getRoomState(roomId)
    return room
  }

  async getWidgetsInRoom(roomId) {
    roomId = parseInt(roomId)
    const widgets = await shared.db.pg.massive.query(`
      SELECT
        widgets.id AS id, widgets._type as _type
      FROM
        widgets JOIN room_widgets ON widgets.id = room_widgets.widget_id
      WHERE
        room_widgets.room_id = $1
        AND
        widgets.deleted_at IS NULL
        AND
        widgets.archived_at IS NULL
    `, [roomId])
    return await this.dynamo.getRoomWidgets(widgets, roomId)
  }

  async addWidgetInRoom(roomWidget) {
    return Promise.all([
      this.dynamo.setWidgetData(roomWidget.widgetId(), roomWidget.widgetState()),
      this.dynamo.setRoomWidgetState(roomWidget.widgetId(), roomWidget.roomId(), roomWidget.roomState())
    ])
  }

  async eraseWidget(widgetId) {
    widgetId = parseInt(widgetId)
    const roomIdEntries = await shared.db.pg.massive.query(`
      SELECT room_id FROM room_widgets WHERE widget_id = $1
    `, [widgetId])
    const roomIds = roomIdEntries.map((r) => (r.room_id))
    await shared.db.pg.massive.query(`
      DELETE FROM widgets WHERE id = $1
    `, [widgetId])
    await shared.db.pg.massive.query(`
      DELETE FROM room_widgets WHERE widget_id = $1
    `, [widgetId])
    return this.dynamo.deleteWidget(roomIds, widgetId)
  }

  async moveWidget(widgetId, roomId, toX, toY) {
    return this.updateWidgetRoomState(widgetId, roomId, {x: toX, y: toY})
  }

  async updateWidgetRoomState(widgetId, roomId, stateUpdate) {
    const widgetRoomState = await this.dynamo.getRoomWidgetState(widgetId, roomId)
    Object.assign(widgetRoomState, stateUpdate)
    return await this.dynamo.setRoomWidgetState(widgetId, roomId, widgetRoomState)
  }

  async updateWidgetState(widgetId, stateUpdate) {
    const widgetState = await this.dynamo.getWidgetState(widgetId, roomId)
    Object.assign(widgetState, stateUpdate)
    return await this.dynamo.setWidgetData(widgetId, roomState)
  }

}

module.exports = RoomData
