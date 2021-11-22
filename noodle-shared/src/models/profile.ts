import { Actor } from '@prisma/client';

import _room from '../db/room/_room';
import _models from './_models';

export default class Profile {
  actor: Actor;
  constructor(actor: Actor) {
    this.actor = actor;
  }

  async serialize() {
    const participantState = await _room.data.getParticipantState(
      this.actor.id,
    );
    const visitableRooms = await _models.RoomWithState.allVisitableForActorId(
      this.actor.id,
    );
    return {
      actor: this.actor,
      participantState,
      rooms: {
        owned: Promise.all(
          visitableRooms.created.map(async (r) => await r.serialize()),
        ),
        member: Promise.all(
          visitableRooms.member.map(async (r) => await r.serialize()),
        ),
      },
    };
  }
}
