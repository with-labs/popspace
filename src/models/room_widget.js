class RoomWidget {
  constructor(roomId, pgWidget, widgetState, roomWidgetState, creatorDisplayName) {
    this._roomId = roomId
    this._pgWidget = pgWidget
    this._widgetState = widgetState
    this._roomWidgetState = roomWidgetState
    this._creatorDisplayName = creatorDisplayName
  }

  widgetId() {
    return this._pgWidget.id
  }

  widgetState() {
    return this._widgetState.state || {}
  }

  roomWidgetState() {
    return this._roomWidgetState.state
  }

  roomId() {
    return this._roomId
  }

  creatorId() {
    return this._pgWidget.creator_id
  }

  creatorDisplayName() {
    return this._creatorDisplayName
  }

  async serialize() {
    return {
      widget_id: this._pgWidget.id,
      creator_id: this._pgWidget.creator_id,
      type: this._pgWidget._type,
      widget_state: this.widgetState(),
      creator_display_name: this.creatorDisplayName(),
      transform: this.roomWidgetState()
    }
  }
}

RoomWidget.fromWidgetId = async (widgetId, roomId) => {
  const pgWidget = await shared.db.pg.massive.widgets.findOne({id: widgetId})
  const widgetState = await shared.db.pg.massive.widget_states.findOne({widget_id: widgetId})
  const roomWidgetState = await shared.db.pg.massive.room_widget_states.findOne({widget_id: widgetId, room_id: roomId})

  return new RoomWidget(roomId, pgWidget, widgetState, roomWidgetState)
}

RoomWidget.allInRoom = async (roomId) => {
  roomId = parseInt(roomId)
  const widgets = await shared.db.pg.massive.query(`
    SELECT
      widgets.id AS id,
      widgets._type as _type,
      widgets.creator_id as creator_id,
      actors.display_name as creator_display_name
    FROM
      widgets
        JOIN room_widgets       ON widgets.id = room_widgets.widget_id
        JOIN actors             ON widgets.creator_id = actors.id
    WHERE
      room_widgets.room_id = $1
      AND
      widgets.deleted_at IS NULL
      AND
      widgets.archived_at IS NULL
  `, [roomId])

  const widgetIds = widgets.map((w) => (w.id))
  const widgetStates = await shared.db.pg.massive.widget_states.find({widget_id: widgetIds})
  const roomWidgetStates = await shared.db.pg.massive.room_widget_states.find({
    widget_id: widgetIds,
    room_id: roomId
  })
  const widgetStatesById = {}
  const roomWidgetStatesById = {}
  const widgetsById = {}
  for(const widgetState of widgetStates) {
    widgetStatesById[widgetState.widget_id] = widgetState
  }
  for(const roomWidgetState of roomWidgetStates) {
    roomWidgetStatesById[roomWidgetState.widget_id] = roomWidgetState
  }
  for(const widget of widgets) {
    widgetsById[widget.id] = widget
  }

  const result = []
  for(const widgetId of widgetIds) {
    const widgetState = widgetStatesById[widgetId]
    const roomWidgetState = roomWidgetStatesById[widgetId]
    const widget = widgetsById[widgetId]
    const roomWidget = new shared.models.RoomWidget(roomId, widget, widgetState, roomWidgetState, widget.creator_display_name)
    result.push(roomWidget)
  }

  return result
}

module.exports = RoomWidget
