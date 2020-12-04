class RoomWidget {
  constructor(roomId, pgWidget, widgetState, roomState) {
    this._roomId = roomId
    this._pgWidget = pgWidget
    this._widgetState = widgetState
    this._roomState = roomState
    roomState.room_id = roomId
  }

  widgetId() {
    return this._pgWidget.id
  }

  widgetState() {
    return this._widgetState
  }

  roomState() {
    return this._roomState
  }

  roomId() {
    return this._roomId
  }

  serialize() {
    return {
      widget_id: this._pgWidget.id,
      type: this._pgWidget._type,
      widgetState: this._widgetState,
      roomState: this._roomState
    }
  }
}

RoomWidget.fromWidgetId = async (widgetId, roomId) => {
  const pgWidgets = await shared.db.pg.massive.query(`
    SELECT id, _type from widgets where id = $1
  `, parseInt(widgetId))
  if(pgWidgets.length < 1) {
    return null
  }
  return await lib.roomData.dynamo.getRoomWidget(pgWidgets[0], roomId)
}

module.exports = RoomWidget
