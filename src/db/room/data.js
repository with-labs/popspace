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
    curState = await shared.db.pg.massive[tableName].findOne(criteria)
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
    const entry = await shared.db.pg.massive.participant_states.find({
      actor_id: actorId
    })
    return entry.state
  }
  async updateParticipantState(actorId, stateUpdate, curState=null) {
    if(stateUpdate.display_name) {
      /*
        TODO: we should use a different route for updating display_name.
        It should not be stored in the participant state.
        The actors table is the source of truth for display_names.

        TODO: logging in shared
      */
      log.error.warn("Setting display_name for actors through updateParticipantState")
      await shared.db.pg.massive.query(`
        UPDATE actors SET display_name = $1 WHERE id = $2
      `, [stateUpdate.display_name, actorId])
      delete stateUpdate.display_name
    }

    return this.setParticipantState(actorId, await getNewState(
      "participant_states", {actor_id: actorId}, stateUpdate, curState
    ))
  }
  async setParticipantState(actorId, newState) {
    return upsertState("participant_states", ["actor_id"], {
      actor_id: actorId,
      state: newState
    })
  }

  async getRoomParticipantState(roomId, actorId) {
    const entry = await shared.db.pg.massive.room_participant_states.find({
      room_id: roomId,
      actor_id: actorId
    })
    return entry.state
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
    return upsertState("room_participant_states", ["room_id", "actor_id"], {
      room_id: roomId,
      actor_id: actorId,
      state: newState
    })
  }

  /************************************************/
  /****************** WIDGETS   *******************/
  /************************************************/
  async addWidgetInRoom(roomWidget) {
    return await shared.db.pg.massive.withTransaction(async (tx) => {
      await tx.widget_states.insert({
        widget_id: roomWidget.widgetId(),
        state: roomWidget.widgetState()
      })
      await tx.room_widget_states.insert({
        room_id: roomWidget.roomId(),
        widget_id: roomWidget.widgetId(),
        state: roomWidget.roomWidgetState()
      })
    })
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
      }, stateUpdate, curState
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
      "widget_states", {widget_id: widgetId}, stateUpdate, curState
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
