class RoomWidget {
  constructor(roomId, pgWidget, widgetState, roomState, creatorDisplayName) {
    this._roomId = roomId
    this._pgWidget = pgWidget
    this._widgetState = widgetState
    this._roomState = roomState
    this._creatorDisplayName = creatorDisplayName
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
      creator_display_name: this._creatorDisplayName,
      transform: this._roomState
    }
  }
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
    roomWidgetStatesById[roomWidgetState.widget_id] = roomWidgetState.state
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
