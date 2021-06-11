module.exports = class {
  constructor(actor) {
    this.actor = actor
  }

  async serialize() {
    const participantState = await shared.db.dynamo.room.getParticipantState(this.actor.id)
    const visitableRooms = await shared.models.RoomWithState.allVisitableForUserId(this.actor.id)
    return {
      actor: this.actor,
      participant_state: participantState,
      rooms: {
        owned: Promise.all(visitableRooms.owned.map(async (r) => await r.serialize())),
        member: Promise.all(visitableRooms.member.map(async (r) => await r.serialize()))
      }
    }
  }
}
