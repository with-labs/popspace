// Never expire by default
const STANDARD_MEMBERSHIP_DURATION_MILLIS = 0

class Invites {
  async getInviteUrlPath(invite) {
    // The inivite can happen for existing users, as well as for new users.
    // For new users, it'd be nice if users immediately went to the signup page -
    // however, if the new user registers before the click the invite, we wouldn't
    // like to render the signup page, and so a check is inevitable as they land on it.
    // Thus, it's not really possible to immediately render a signup page for new users,
    // and we must always check whether the user exists before rendering that page.
    const email = shared.lib.args.consolidateEmailString(invite.email)
    const roomNameEntry = await shared.db.rooms.preferredNameById(invite.room_id)
    // TODO: remove invite.id from the link after the otp-only migration is complete
    return `join_room?otp=${encodeURIComponent(invite.otp)}&iid=${encodeURIComponent(invite.id)}&email=${encodeURIComponent(email)}&room=${encodeURIComponent(roomNameEntry.name)}`
  }

  async getRoomInvites(roomId) {
    return await shared.db.pg.massive.room_invitations.find({
      room_id: roomId,
      resolved_at: null,
      revoked_at: null,
      'email <>': null // to avoid shareable invite links
    }, {
      order: [{
        field: "created_at",
        direction: "desc"
      }]
    })
  }

  /*
    DEPRECATED: We shouldn't need to use this.
    Codes should be fetched by OTP.
  */
  async inviteById(id) {
    return await shared.db.pg.massive.room_invitations.findOne({id: id})
  }

  async inviteByOtp(otp) {
    return await shared.db.pg.massive.room_invitations.findOne({otp: otp})
  }

  async activeInvitesByEmailAndRoomId(email, roomId) {
    return await shared.db.pg.massive.room_invitations.find({
      email: email,
      room_id: roomId,
      revoked_at: null
    })
  }

  async latestRoomInvitation(roomId, inviteeEmail) {
    const invitations = await shared.db.pg.massive.room_invitations.find({
      revoked_at: null,
      room_id: roomId,
      email: shared.lib.args.consolidateEmailString(inviteeEmail)
    }, {
      order: [{
        field: "created_at",
        direction: "desc"
      }],
      limit: 1
    })
    return invitations[0]
  }

  async createInvitation(roomId, inviteeEmail, inviterId, roomDisplayName) {
    let otpPrefix = ""
    if(roomDisplayName) {
      const urlName = await shared.db.room.namesAndRoutes.getUrlName(roomDisplayName)
      otpPrefix = `${urlName}-`
    }
    return await shared.db.pg.massive.room_invitations.insert({
      room_id: roomId,
      email: shared.lib.args.consolidateEmailString(inviteeEmail),
      otp: `${otpPrefix}${shared.lib.otp.generate()}`,
      issued_at: shared.db.time.now(),
      expires_at: shared.lib.otp.expirationInNDays(30),
      membership_duration_millis: STANDARD_MEMBERSHIP_DURATION_MILLIS,
      inviter_id: inviterId
    })
  }

  isValidInvitation(invitation, email, otp) {
    const verification = shared.lib.otp.verify(invitation, otp)
    if(verification.error != null) {
      return verification
    }
    if(shared.lib.args.consolidateEmailString(invitation.email) != shared.lib.args.consolidateEmailString(email)) {
      return { error: shared.error.code.INVALID_OTP }
    }
    return { isValid: true, error: null }
  }

  async revokeInvitation(invitationId) {
    return await shared.db.pg.massive.room_invitations.update(
      {id: invitationId},
      {revoked_at: shared.db.time.now()}
    )
  }

  async resolveInvitation(invitation, user, otp) {
    const verification = shared.db.room.invites.isValidInvitation(invitation, user.email, otp)
    if(verification.error != null) {
      return verification
    }
    return this.initiateMembership(invitation, user)
  }

  async enablePublicInviteUrl(roomId, enablerId, roomDisplayName) {
    const existingUrls = await this.getActivePublicInvites(roomId)
    if(existingUrls.length > 0) {
      return existingUrls[0]
    }
    let otpPrefix = ""
    if(roomDisplayName) {
      const urlName = await shared.db.room.namesAndRoutes.getUrlName(roomDisplayName)
      otpPrefix = `${urlName}-`
    }
    return shared.db.pg.massive.room_invitations.insert({
      room_id: roomId,
      issued_at: shared.db.time.now(),
      otp: `${otpPrefix}${shared.lib.otp.generate()}`,
      email: null, // for now, email = null means any email
      inviter_id: enablerId
    })
  }

  async disablePublicInviteUrl(roomId) {
    const existingUrls = await this.getActivePublicInvites(roomId)
    const promises = existingUrls.map(async (existingUrl) => {
      await shared.db.pg.massive.room_invitations.update({
        room_id: roomId,
        revoked_at: null,
        email: null
      }, {
        revoked_at: shared.db.time.now()
      })
    })
    return Promise.all(promises)
  }

  /*
    DEPRECATED: misnomer, it returns the invites, not a URL.
    user getActivePublicInvites instead
  */
  async getActivePublicInviteUrls(roomId) {
    return await this.getActivePublicInvites(roomId)
  }

  async getActivePublicInvites(roomId) {
    /*
      An empty return list here means the
      public invite URL is deactivated.
      There's no separate getter for that bool,
      since everywhere we need it we also need
      the list of URLs if it's not empty immediately after.
    */
    const candidates = await shared.db.pg.massive.room_invitations.find({
      room_id: roomId,
      revoked_at: null,
      email: null
    })
    const valid = candidates.filter((c) => (shared.lib.otp.checkEntryValidityUnresolvable(c).error == null))
    return valid
  }

  async joinRoomThroughPublicInvite(invite, user, otp) {
    const verification = shared.lib.otp.verifyUnresolvable(invite, otp)
    if(verification.error) {
      return verification
    }
    return this.initiateMembership(invite, user)
  }

  isPublicInvite(invite) {
    return !invite.email
  }

  // private
  async initiateMembership(invitation, user) {
    const room = await shared.db.rooms.roomById(invitation.room_id)
    if(!room) {
      return { error: shared.error.code.UNKNOWN_ROOM }
    }
    if(room.owner_id == user.id) {
      return { error: shared.error.code.JOIN_ALREADY_MEMBER }
    }
    const existingMembership = await shared.db.room.memberships.getMembership(user.id, invitation.room_id)
    if(existingMembership) {
      return existingMembership
    }
    try {
      let expires_at = null // non-expiring memberships by default
      if(invitation.membership_duration_millis && invitation.membership_duration_millis > 0) {
        expires_at = shared.db.time.timestamptzPlusMillis(invitation.issued_at, invitation.membership_duration_millis)
      }
      let resolved_at = null
      if(invitation.email) {
        /*
          Personal invites are single-use,
          but public invite links are re-usable
        */
        resolved_at = shared.db.time.now()
      }
      const membership = await shared.db.pg.massive.withTransaction(async (tx) => {
        if(!this.isPublicInvite(invitation)) {
          await tx.room_invitations.update({id: invitation.id}, { resolved_at })
        }
        return await tx.room_memberships.insert({
          room_id: invitation.room_id,
          user_id: user.id,
          invitation_id: invitation.id,
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

module.exports = new Invites()
