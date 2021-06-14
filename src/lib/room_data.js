const DEFAULT_PARTICIPANT_STATE = {
  position: {
    x: 0,
    y: 0
  }
}

class RoomData {
  constructor() {
  }

  async init() {
  }

  /*
    Participant-related management probably does not go into shared,
    at least not yet.
    But with most other things moving out, perhaps this should just go
    straight into Particiants, and room_data sould be dropped.
  */
  async addParticipantInRoom(roomId, actorId, state=DEFAULT_PARTICIPANT_STATE) {
    await shared.db.dynamo.room.setRoomParticipantState(roomId, actorId, state)
  }

  async updateRoomParticipantState(roomId, participant, stateUpdate, currentState=null) {
    const actorId = participant.actor.id
    if(!currentState) {
      currentState = await shared.db.dynamo.room.getRoomParticipantState(roomId, actorId)
    }
    const newState = Object.assign(currentState || {}, stateUpdate)
    await shared.db.dynamo.room.setRoomParticipantState(roomId, actorId, newState)
    return newState
  }

  async updateParticipantState(participant, stateUpdate) {
    const actorId = participant.actor.id
    let currentState = await participant.getState()
    const newState = Object.assign(currentState || {}, stateUpdate)
    if(stateUpdate.display_name) {
      await shared.db.pg.massive.query(`
        UPDATE actors SET display_name = $1 WHERE id = $2
      `, [stateUpdate.display_name, actorId])
    }
    await shared.db.dynamo.room.setParticipantState(actorId, newState)
    return newState
  }

}

module.exports = RoomData
