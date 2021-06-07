class Memberships {
  async isMember(userId, roomId) {
    const membership = await this.getMembership(userId, roomId)
    if(!membership) {
      return false
    }
    const current = shared.db.time.timestamptzStillCurrent(membership.expires_at)
    return current
  }

  async getMembership(userId, roomId) {
    return await shared.db.pg.massive.room_memberships.findOne({
      user_id: userId,
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

  /*
    DEPRECATED, use permissions.canEnter instead
  */
  async hasAccess(userId, roomId) {
    const room = await shared.db.rooms.roomById(roomId)
    if(!room) {
      return false
    }
    if(room.is_public) {
      return true
    }
    if(room.owner_id == userId) {
      return true
    }
    return await this.isMember(userId, roomId)
  }

  async getRoomMembers(roomId) {
    const memberships = await shared.db.pg.massive.room_memberships.find({
      room_id: roomId,
      revoked_at: null
    })
    const userIds = memberships.map((m) => (m.user_id))
    const users = await shared.db.pg.massive.users.find({id: userIds})
    await Promise.all(
      users.map(async (u) => {
        u.participantState = await shared.db.dynamo.room.getParticipantState(u.id)
        return u
      })
    )
    return users
  }

  async revokeMembership(roomId, userId) {
    return await shared.db.pg.massive.room_memberships.update(
      {
        user_id: userId,
        room_id: roomId,
        revoked_at: null
      },
      { revoked_at: shared.db.time.now() }
    )
  }

  async forceMembership(room, user) {
    if(room.owner_id == user.id) {
      /*
        TODO: Update the error code, or alternatively allow owners to be members
      */
      return { error: shared.error.code.JOIN_ALREADY_MEMBER }
    }
    const existingMembership = await shared.db.room.memberships.getMembership(user.id, room.id)
    if(existingMembership) {
      return existingMembership
    }
    try {
      let expires_at = null // non-expiring memberships by default
      let resolved_at = null
      const membership = await shared.db.pg.massive.withTransaction(async (tx) => {
        return await tx.room_memberships.insert({
          room_id: room.id,
          user_id: user.id,
          began_at: shared.db.time.now(),
          expires_at: expires_at
        })
      })
      return { membership }
    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: shared.error.code.UNEXPECTER_ERROR }
    }
  }
}

module.exports = new Memberships()
