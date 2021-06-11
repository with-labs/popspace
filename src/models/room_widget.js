class RoomWidget {
  constructor(roomId, pgWidget, widgetState, roomState, ownerDisplayName) {
    this._roomId = roomId
    this._pgWidget = pgWidget
    this._widgetState = widgetState
    this._roomState = roomState
    this._ownerDisplayName = ownerDisplayName
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

  ownerId() {
    return this._pgWidget.owner_id
  }

  ownerDisplayName() {
    return this._ownerDisplayName
  }

  async serialize() {
    return {
      widget_id: this._pgWidget.id,
      owner_id: this._pgWidget.owner_id,
      type: this._pgWidget._type,
      widget_state: this.widgetState(),
      /*
        NOTE: the way we get the display name now is a bit ugly.
        We create RoomWidget objects in various contexts, and
        we don't always have the actor's display name handy -
        so right now we receive just the display name as an extra arg,
        and we have to JOIN with actors in many contexts to get it.

        Perhaps it'd be nicer to have serialize() be async,
        then we could fetch it as we serialize, and eventually
        fetch it from a cached global store.

        FOLLOWUP: E.g. in another context though, it's really nice
        to be able to override the display name no matter who the owner is:
        for our system-made objects, like for default objects created in rooms,
        it's nice to control the owner name based on the context, not the owner.
      */
      owner_display_name: this._ownerDisplayName,
      transform: this._roomState
    }
  }
}

RoomWidget.fromWidgetId = async (widgetId, roomId) => {
  const pgWidgets = await shared.db.pg.massive.query(`
    SELECT
      widgets.id, widgets._type, widgets.owner_id,
      actors.display_name AS owner_display_name
    FROM widgets JOIN actors ON widgets.owner_id = actors.id
    WHERE widgets.id = $1
  `, parseInt(widgetId))
  if(pgWidgets.length < 1) {
    return null
  }
  return await shared.db.dynamo.room.getRoomWidget(roomId, pgWidgets[0])
}

module.exports = RoomWidget
