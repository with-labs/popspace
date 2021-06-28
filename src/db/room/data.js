const upsertState = async (table, pkeys, newState) => {
  // https://massivejs.org/docs/options-objects#onconflict
  await shared.db.pg.massive[table].insert(newState, {
    onConflict: {
      target: pkeys,
      action: "update"
    }
  })
  return newState
}

const getNewState = async (tableName, criteria, stateUpdate, curState=null) => {
  /*
    This is quite abstract, but it helps cut down repetition for
    state updates.

    We'd like state updates to be non-overriding usually,
    i.e. something like {a: 1, b: 2} updated with {a: 4, c: 3} should
    result in {a: 4, b: 2, c: 3}, vs {a: 4, c: 3}.

    To do that, we currently first fetch the state,
    then do an Object.assign().

    This update could maybe be done more efficiently with JSONB,
    since it supports setting fields via JSONB_SET
    https://www.postgresql.org/docs/9.5/functions-json.html

    For now performance is not a bottleneck, and it's not clear
    whether that optimization would really improve things significantly.

    If we do run into bottlenecks, it may be that explicitly
    extracting JSON fields into columns will be the best solution.
  */
  if(!curState) {
    curState = (await shared.db.pg.massive[tableName].findOne(criteria)).state
  }
  return Object.assign(curState || {}, stateUpdate)
}

class Data {
  /************************************************/
  /****************** ROOM      *******************/
  /************************************************/
  async setRoomState(roomId, newState) {
    return upsertState("room_states", "room_id", {
      room_id: roomId, state: newState
    })
  }

  async updateRoomState(roomId, stateUpdate, curState=null) {
    return this.setRoomState(roomId, await getNewState(
      "room_states", {room_id: roomId}, stateUpdate, curState
    ))
  }

  async getRoomState(roomId) {
    return await shared.db.pg.massive.room_states.findOne({room_id: roomId})
  }
  /************************************************/
  /****************** PARTICIPANTS   **************/
  /************************************************/

  async getParticipantState(actorId) {
    const entry = await shared.db.pg.massive.participant_states.findOne({
      actor_id: actorId
    })
    return entry ? entry.state : null
  }
  async updateParticipantState(actorId, participantState, curState=null) {
    return this.setParticipantState(actorId, await getNewState(
      "participant_states", {actor_id: actorId}, participantState, curState
    ))
  }
  async setParticipantState(actorId, newState) {
    const result = await upsertState("participant_states", ["actor_id"], {
      actor_id: actorId,
      state: newState
    })
    return result.state
  }

  async getRoomParticipantState(roomId, actorId) {
    const entry = await shared.db.pg.massive.room_participant_states.findOne({
      room_id: roomId,
      actor_id: actorId
    })
    return entry ? entry.state : null
  }
  async updateRoomParticipantState(roomId, actorId, stateUpdate, curState=null) {
    return this.setRoomParticipantState(roomId, actorId, await getNewState(
      "room_participant_states", {
        room_id: roomId,
        actor_id: actorId
      }, stateUpdate, curState
    ))
  }
  async setRoomParticipantState(roomId, actorId, newState) {
    const entry = await upsertState("room_participant_states", ["room_id", "actor_id"], {
      room_id: roomId,
      actor_id: actorId,
      state: newState
    })
    return entry.state
  }

  /************************************************/
  /****************** WIDGETS   *******************/
  /************************************************/
  async addWidgetInRoom(creatorId, roomId, type, desiredWidgetState, desiredRoomWidgetState, creator=null) {
    const { widget, roomWidget, widgetState, roomWidgetState } = await shared.db.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({
        creator_id: creatorId,
        _type: type,
      })
      const roomWidget = await tx.room_widgets.insert({
        widget_id: widget.id,
        room_id: roomId,
      })
      const widgetState = await tx.widget_states.insert({
        widget_id: widget.id,
        state: desiredWidgetState
      })
      const roomWidgetState = await tx.room_widget_states.insert({
        room_id: roomId,
        widget_id: widget.id,
        state: desiredRoomWidgetState
      })
      return { widget, roomWidget, widgetState, roomWidgetState }
    })
    const model = new shared.models.RoomWidget(roomId, widget, widgetState, roomWidgetState)
    if(creator) {
      model.setCreator(creator)
    }
    return model
  }

  async softDeleteWidget(widgetId) {
    widgetId = parseInt(widgetId)
    return shared.db.pg.massive.query(`
      UPDATE widgets SET deleted_at = now() WHERE id = $1
    `, widgetId)
  }

  async eraseWidget(widgetId) {
    widgetId = parseInt(widgetId)
    return await shared.db.pg.massive.withTransaction(async (tx) => {
      await tx.widgets.destroy({id: widgetId})
      await tx.room_widgets.destroy({id: widgetId})
      await tx.widget_states.destroy({widget_id: widgetId})
      await tx.room_widget_states.destroy({widget_id: widgetId})
    })
  }

  async getRoomWidgetState(roomId, widgetId) {
    const entry = await shared.db.pg.massive.room_widget_states.find({
      room_id: roomId,
      widget_id: widgetId
    })
    return entry.state
  }

  async updateRoomWidgetState(roomId, widgetId, stateUpdate, roomWidgetState=null) {
    return this.setRoomWidgetState(roomId, widgetId, await getNewState(
      "room_widget_states", {
        room_id: roomId,
        widget_id: widgetId
      }, stateUpdate, roomWidgetState
    ))
  }
  async setRoomWidgetState(roomId, widgetId, newState) {
    return upsertState("room_widget_states", ["room_id", "widget_id"], {
      room_id: roomId,
      widget_id: widgetId,
      state: newState
    })
  }

  async getWidgetState(widgetId) {
    const entry = await shared.db.pg.massive.widget_states.find({
      widget_id: widgetId
    })
    return entry.state
  }
  async updateWidgetState(widgetId, stateUpdate, widgetState=null) {
    return this.setWidgetState(widgetId, await getNewState(
      "widget_states", {widget_id: widgetId}, stateUpdate, widgetState
    ))
  }
  async setWidgetState(widgetId, newState) {
    return upsertState("widget_states", ["widget_id"], {
      widget_id: widgetId,
      state: newState
    })
  }
}

module.exports = new Data()
