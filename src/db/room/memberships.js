class Memberships {
  async isMember(actorId, roomId) {
    const membership = await this.getMembership(actorId, roomId)
    if(!membership) {
      return false
    }
    const current = shared.db.time.timestamptzStillCurrent(membership.expires_at)
    return current
  }

  async getMembership(actorId, roomId) {
    return await shared.db.pg.massive.room_memberships.findOne({
      actor_id: actorId,
      room_id: roomId,
      revoked_at: null,
      "began_at <>": null
    }, {
      /*
        There's some optionality here.
        E.g. we could choose the membership that will
        expire the most in the future, though
        not all memberships expire. Perhaps those
        are the best to choose among non-revoked ones anyway.
        On the other hand if we choose the latest issued one,
        seems like that's the one we should give, since
        for whatever reason that membership was accepted.
        In practice, we should only have 1 active membership
        per person anyway.
      */
      order: [{
        field: "began_at",
        direction: "desc"
      }],
      limit: 1
    })
  }

  async getRoomMembers(roomId) {
    return await shared.models.RoomMember.allInRoom(roomId)
  }

  async revokeMembership(roomId, actorId) {
    return await shared.db.pg.massive.room_memberships.update(
      {
        actor_id: actorId,
        room_id: roomId,
        revoked_at: null
      },
      { revoked_at: shared.db.time.now() }
    )
  }

  async forceMembership(room, actor) {
    /*
      NOTE: we're currently allowing room creators to be members.

      It seems that creating a room should allow joining it by default.

      We can either allow creators to join, or make creators members.

      Perhaps it's easier to just make everyone a member, and in situations
      where creators should be treated differently, they can explicitly be
      treated differently.
    */
    const existingMembership = await shared.db.room.memberships.getMembership(actor.id, room.id)
    if(existingMembership) {
      return existingMembership
    }
    try {
      let expires_at = null // non-expiring memberships by default
      let resolved_at = null
      const membership = await shared.db.pg.massive.withTransaction(async (tx) => {
        return await tx.room_memberships.insert({
          room_id: room.id,
          actor_id: actor.id,
          began_at: shared.db.time.now(),
          expires_at: expires_at
        })
      })
      return { membership }
    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: shared.error.code.UNEXPECTED_ERROR }
    }
  }
}

module.exports = new Memberships()
