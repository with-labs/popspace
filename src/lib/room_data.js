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

  /* Perhaps this can go into shared */
  async getRoomData(roomId) {
    /**
      TODO: probably make a RoomData model in shared
      that captures this format and has helpers like
      being constructed from roomId
    */
    const room = {}
    const widgetsInRoom = await shared.db.room.widgets.getWidgetsInRoom(roomId)
    room.widgets = widgetsInRoom.map((w) => (w.serialize()))
    room.id = roomId
    room.state = await shared.db.dynamo.room.getRoomState(roomId)
    const activePublicInviteUrls = await shared.db.room.invites.getActivePublicInviteUrls(roomId)
    room.public_invite_url = activePublicInviteUrls[0]
    return room
  }

  /*
    Participant-related maangement probably does not go into shared,
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

  async removeParticipant(roomId, participant) {
    /*
      When might we need this?
      Not so much when people leave the room, or lose their membership.
      If they ever come back, we can keep their data.
      If the actor or room is deleted though there's no reason to keep the data entry around.
      Perhaps the best way to handle that is just with a background sweep job.
    */
    return shared.db.dynamo.room.deleteParticipant(roomId, participant.actor.id)
  }
}

module.exports = RoomData
