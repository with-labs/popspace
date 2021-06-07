class Claims {
  async getClaimUrlPath(claim) {
    return `claim_room?otp=${encodeURIComponent(claim.otp)}&cid=${encodeURIComponent(claim.id)}&email=${encodeURIComponent(claim.email)}`
  }

  async tryToCreateClaim(email, roomName, allowRegistered=false, createNewRooms=false, allowTransfer=false) {
    email = shared.lib.args.consolidateEmailString(email)
    const user = await shared.db.accounts.userByEmail(email)
    if(user) {
      if(allowRegistered) {
        console.log(`Warning: user ${user.email} already registered.`)
      } else {
        return { error: shared.error.code.ALREADY_REGISTERED, user: user }
      }
    }

    let roomNameEntry = await shared.db.pg.massive.room_names.findOne({name: roomName})
    if(!roomNameEntry) {
      if(createNewRooms) {
        const priorityLevel = 1
        const isVanity = true
        const ownerId = null
        const createResult =  await shared.db.rooms.createRoomWithRoute(roomName, ownerId, priorityLevel, isVanity)
        roomNameEntry = createResult.roomNameEntry
      } else {
        return { error: shared.error.code.UNKNOWN_ROOM }
      }
    }

    let room = await shared.db.rooms.roomById(roomNameEntry.room_id)
    const existingClaim = await shared.db.pg.massive.room_claims.findOne({room_id: room.id})
    if(existingClaim) {
      if(allowTransfer) {
        // Not yet supported
      } else {
        return {
          error: shared.error.code.CLAIM_UNIQUENESS,
          claim: existingClaim,
          room: room,
          roomNameEntry: roomNameEntry
        }
      }
    } else {
      const claim = await shared.db.room.claims.createClaim(room.id, email)
      return { claim, room, roomNameEntry }
    }
  }

  async createClaim(roomId, claimerEmail, expiresAt = null) {
    return await shared.db.pg.massive.room_claims.insert({
      room_id: roomId,
      email: claimerEmail,
      otp: shared.lib.otp.generate(),
      issued_at: shared.db.time.now(),
      expires_at: expiresAt
    })
  }

  async claimUpdateEmailedAt(claimId) {
    return await shared.db.pg.massive.room_claims.update({id: claimId}, {emailed_at: shared.db.time.now()})
  }

  async resolveClaim(claim, user, otp) {
    const verification = shared.lib.otp.isValidForEmail(otp, user.email, claim)
    if(verification.error != null) {
      return verification
    }

    try {
      return await shared.db.pg.massive.withTransaction(async (tx) => {
        await tx.room_claims.update({id: claim.id}, {resolved_at: shared.db.time.now()})
        return await tx.rooms.update({id: claim.room_id}, {owner_id: user.id})
      })

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: shared.error.code.UNEXPECTER_ERROR }
    }
  }
}

module.exports = new Claims()
