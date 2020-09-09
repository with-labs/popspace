const DbAccess = require("./pg/db_access")
const cryptoRandomString = require('crypto-random-string');
const LOWERCASE_AND_NUMBERS = 'abcdefghijklmnopqrstuvwxyz0123456789'

const MAX_FREE_ROOMS = 3
// Never expire by default
const STANDARD_MEMBERSHIP_DURATION_MILLIS = 0

class Rooms extends DbAccess {
  constructor() {
    super()
  }

  generateIdString() {
    // NOTE:
    // We want to maintain a relatively low collision rate
    // Collision rate is a product of the randomness space and # of taken slots
    // with a 36-char alphabet of length 5, we get 36^5 or 6 * 10^7 unique ids
    // if we want to maintain a <1% collision rate, we can have 6 * 10^5 entries
    // i.e. 600k rooms
    // At that point we want to bump the length, e.g. 36^6 is 2*10^9 uniques
    return cryptoRandomString({length: 5, characters: LOWERCASE_AND_NUMBERS});
  }

  async getInviteUrl(appUrl, invite) {
    // The inivite can happen for existing users, as well as for new users.
    // For new users, it'd be nice if users immediately went to the signup page -
    // however, if the new user registers before the click the invite, we wouldn't
    // like to render the signup page, and so a check is inevitable as they land on it.
    // Thus, it's not really possible to immediately render a signup page for new users,
    // and we must always check whether the user exists before rendering that page.
    const email = util.args.consolidateEmailString(invite.email)
    return `${appUrl}/join_room?otp=${invite.otp}&iid=${invite.id}&email=${email}`
  }

  async inviteById(id) {
    return await db.pg.massive.room_invitations.findOne({id: id})
  }

  async roomById(id) {
    return await db.pg.massive.rooms.findOne({id: id})
  }

  async isMember(userId, roomId) {
    const membership = await db.pg.massive.room_memberships.findOne({user_id: userId, room_id: roomId})
    if(!membership) {
      return false
    }
    const current = this.timestamptzStillCurrent(membership.expires_at)
    const revoked = this.timestamptzHasPassed(membership.revoked_at)
    return current && !revoked
  }

  async generateRoom(userId) {
    let idString = this.generateIdString()
    let isUnique = await this.isUniqueIdString(idString)
    while(!isUnique) {
      // TODO: alert if too many collisions
      idString = this.generateIdString()
      isUnique = await this.isUniqueIdString(idString)
    }
    return await db.pg.massive.rooms.insert({
      owner_id: userId,
      unique_id: idString
    })
  }

  async latestRoomInvitation(roomId, inviteeEmail) {
    const invitations = await db.pg.massive.room_invitations.find({
      room_id: roomId,
      email: util.args.consolidateEmailString(inviteeEmail)
    }, {
      order: [{
        field: "created_at",
        direction: "desc"
      }],
      limit: 1
    })
    return invitations[0]
  }

  async createInvitation(roomId, inviteeEmail) {
    return await db.pg.massive.room_invitations.insert({
      room_id: roomId,
      email: util.args.consolidateEmailString(inviteeEmail),
      otp: lib.db.otp.generate(),
      issued_at: this.now(),
      expires_at: lib.db.otp.standardExpiration(),
      membership_duration_millis: STANDARD_MEMBERSHIP_DURATION_MILLIS
    })
  }

  isValidInvitation(invitation, email, otp) {
    const verification = lib.db.otp.verify(invitation, otp)
    if(verification.error != null) {
      return verification
    }
    if(util.args.consolidateEmailString(invitation.email) != util.args.consolidateEmailString(email)) {
      return { error: lib.db.ErrorCodes.otp.INVALID_OTP }
    }
    return { isValid: true, error: null }
  }

  async resolveInvitation(invitation, user, otp) {
    const verification = this.isValidInvitation(invitation, user.email, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      let expires_at = null // non-expiring memberships by default
      if(invitation.membership_duration_millis && invitation.membership_duration_millis > 0) {
        expires_at = this.timestamptzPlusMillis(invitation.issued_at, invitation.membership_duration_millis)
      }

      const membership = await db.pg.massive.withTransaction(async (tx) => {
        await tx.room_invitations.update({id: invitation.id}, {resolved_at: this.now()})
        return await tx.room_memberships.insert({
          room_id: invitation.room_id,
          user_id: user.id,
          invitation_id: invitation.id,
          began_at: this.now(),
          expires_at: expires_at
        })
      })

      return { membership }
    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    }
  }

  async getOwnedRooms(userId) {
    return await db.pg.massive.rooms.find({
      owner_id: userId
    })
  }

  async tryToGenerateRoom(userId) {
    const canGenerate = await this.underMaxOwnedRoomLimit(userId)
    if(!canGenerate) {
      return { error : lib.db.ErrorCodes.room.TOO_MANY_OWNED_ROOMS }
    }
    // We may want to add a lock here to avoid race conditions:
    // the check passed, a new request is sent, also passes checks,
    // 2 rooms are created
    const newRoom = await this.generateRoom(userId)
    return { newRoom }
  }

  async getMemberRooms(userId) {
    return await db.pg.massive.query(`
      SELECT
        rooms.id,
        rooms.unique_id,
        rooms.name,
        rooms.owner_id
          FROM room_memberships LEFT OUTER JOIN rooms
            ON room_memberships.room_id = rooms.id
          WHERE room_memberships.user_id = ${userId}
    `)
  }

  // Private
  async isUniqueIdString(idString) {
    const existingEntry = await db.pg.massive.rooms.findOne({unique_id: idString})
    return !existingEntry
  }

  async underMaxOwnedRoomLimit(userId) {
    const count = await db.pg.massive.rooms.count({owner_id: userId})
    return count < MAX_FREE_ROOMS
  }
}

module.exports = Rooms
