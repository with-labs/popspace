module.exports = class {
  actor: any;
  constructor(actor) {
    this.actor = actor;
  }

  async serialize() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const participantState = await shared.db.room.data.getParticipantState(
      this.actor.id,
    );
    const visitableRooms =
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      await shared.models.RoomWithState.allVisitableForUserId(this.actor.id);
    return {
      actor: this.actor,
      participantState,
      rooms: {
        owned: Promise.all(
          visitableRooms.owned.map(async (r) => await r.serialize()),
        ),
        member: Promise.all(
          visitableRooms.member.map(async (r) => await r.serialize()),
        ),
      },
    };
  }
};
