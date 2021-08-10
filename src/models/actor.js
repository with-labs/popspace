class Actor {
  constructor(pgActor) {
    this._pgActor = pgActor;
  }

  actorId() {
    return this._pgActor.id;
  }

  displayName() {
    return this._pgActor.displayName;
  }

  kind() {
    return this._pgActor.kind;
  }

  async serialize() {
    return {
      actorId: this.actorId(),
      displayName: this.displayName(),
      kind: this.kind(),
    };
  }
}

Actor.fromActorId = async (actorId) => {
  const pgActor = await shared.db.accounts.actorById(actorId);
  if (!pgActor) {
    return null;
  }
  return new Actor(pgActor);
};

module.exports = Actor;
