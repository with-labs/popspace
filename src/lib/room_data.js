const RoomDynamo = require("./room_data/room_dynamo")

const DEFAULT_PARTICIPANT_STATE = {
  position: {
    x: 0,
    y: 0
  }
}

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
        widgets.id AS id, widgets._type as _type, widgets.owner_id as owner_id
      FROM
        widgets JOIN room_widgets ON widgets.id = room_widgets.widget_id
      WHERE
        room_widgets.room_id = $1
        AND
        widgets.deleted_at IS NULL
        AND
        widgets.archived_at IS NULL
    `, [roomId])
    return await this.dynamo.getRoomWidgets(roomId, widgets)
  }

  async addWidgetInRoom(roomWidget) {
    return Promise.all([
      this.dynamo.setWidgetData(roomWidget.widgetId(), roomWidget.widgetState()),
      this.dynamo.setRoomWidgetState(roomWidget.roomId(), roomWidget.widgetId(), roomWidget.roomState())
    ])
  }

  async addParticipantInRoom(roomId, userId, state=DEFAULT_PARTICIPANT_STATE) {
    await this.dynamo.setRoomParticipantState(roomId, userId, state)
  }

  async updateRoomParticipantState(roomId, participant, stateUpdate, currentState=null) {
    const userId = participant.user.id
    if(!currentState) {
      currentState = await this.dynamo.getRoomParticipantState(roomId, userId)
    }
    const newState = Object.assign(currentState || {}, stateUpdate)
    return this.dynamo.setRoomParticipantState(roomId, userId, newState)
  }

  async updateParticipantState(participant, stateUpdate, currentState=null) {
    const userId = participant.user.id
    if(!currentState) {
      currentState = await this.dynamo.getParticipantState(userId)
    }
    const newState = Object.assign(currentState || {}, stateUpdate)
    if(stateUpdate.display_name) {
      await shared.db.pg.massive.query(`
        UPDATE users SET display_name = $1 WHERE id = $2
      `, stateUpdate.display_name, userId)
    }
    return this.dynamo.setParticipantState(userId, newState)
  }

  async removeParticipant(roomId, participant) {
    /*
      When might we need this?
      Not so much when people leave the room, or lose their membership.
      If they ever come back, we can keep their data.
      If the user or room is deleted though there's no reason to keep the data entry around.
      Perhaps the best way to handle that is just with a background sweep job.
    */
    return this.dynamo.deleteParticipant(roomId, participant.user.id)
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
    return this.dynamo.deleteWidget(roomIds, widgetId)
  }

  async updateWidgetRoomState(roomId, widgetId, stateUpdate, widgetRoomState=null) {
    if(!widgetRoomState) {
      widgetRoomState = await this.dynamo.getRoomWidgetState(roomId, widgetId)
    }
    Object.assign(widgetRoomState, stateUpdate)
    return await this.dynamo.setRoomWidgetState(roomId, widgetId, widgetRoomState)
  }

  async updateWidgetState(widgetId, stateUpdate) {
    const widgetState = await this.dynamo.getWidgetState(widgetId)
    Object.assign(widgetState, stateUpdate)
    return await this.dynamo.setWidgetData(widgetId, widgetState)
  }

}

module.exports = RoomData
