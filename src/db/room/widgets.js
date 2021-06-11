class Widgets {
  async getWidgetsInRoom(roomId) {
    roomId = parseInt(roomId)
    const widgets = await shared.db.pg.massive.query(`
      SELECT
        widgets.id AS id,
        widgets._type as _type,
        widgets.creator_id as creator_id,
        actors.display_name as creator_display_name
      FROM
        widgets
          JOIN room_widgets ON widgets.id = room_widgets.widget_id
          JOIN actors       ON widgets.creator_id = actors.id
      WHERE
        room_widgets.room_id = $1
        AND
        widgets.deleted_at IS NULL
        AND
        widgets.archived_at IS NULL
    `, [roomId])
    return await shared.db.dynamo.room.getRoomWidgets(roomId, widgets)
  }

  async addWidgetInRoom(roomWidget) {
    return Promise.all([
      shared.db.dynamo.room.setWidgetData(roomWidget.widgetId(), roomWidget.widgetState()),
      shared.db.dynamo.room.setRoomWidgetState(roomWidget.roomId(), roomWidget.widgetId(), roomWidget.roomState())
    ])
  }

  async softDeleteWidget(widgetId) {
    widgetId = parseInt(widgetId)
    return shared.db.pg.massive.query(`
      UPDATE widgets SET deleted_at = now() WHERE id = $1
    `, widgetId)
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
    return shared.db.dynamo.room.deleteWidget(roomIds, widgetId)
  }

  async updateWidgetRoomState(roomId, widgetId, stateUpdate, widgetRoomState=null) {
    if(!widgetRoomState) {
      widgetRoomState = await shared.db.dynamo.room.getRoomWidgetState(roomId, widgetId)
    }
    Object.assign(widgetRoomState, stateUpdate)
    return await shared.db.dynamo.room.setRoomWidgetState(roomId, widgetId, widgetRoomState)
  }

  async updateWidgetState(widgetId, stateUpdate) {
    const widgetState = await shared.db.dynamo.room.getWidgetState(widgetId)
    Object.assign(widgetState, stateUpdate)
    return await shared.db.dynamo.room.setWidgetData(widgetId, widgetState)
  }

}

module.exports = new Widgets()
