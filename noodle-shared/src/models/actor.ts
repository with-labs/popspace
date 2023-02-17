import { Actor as DbActor } from '@prisma/client';

import accounts from '../db/accounts';

class Actor {
  static fromActorId = async (actorId: number) => {
    const pgActor = await accounts.actorById(actorId);
    if (!pgActor) {
      return null;
    }
    return new Actor(pgActor);
  };

  _pgActor: DbActor;

  constructor(pgActor: DbActor) {
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

export default Actor;
