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
    const existingUser = await this.pg.users.findOne({email: invite.email})
    if(existingUser) {
      return `${appUrl}/join_room?otp=${invite.otp}&iid=${invite.id}`
    } else {
      return `${appUrl}/invited?otp=${invite.otp}&iid=${invite.id}`
    }
  }

  async inviteById(id) {
    return await this.pg.room_invitations.findOne({id: id})
  }

  async roomById(id) {
    return await this.pg.rooms.find({id: id})
  }

  async generateRoom(userId) {
    let idString = this.generateIdString()
    let isUnique = await this.isUniqueIdString(idString)
    while(!isUnique) {
      // TODO: alert if too many collisions
      idString = this.generateIdString()
      isUnique = await this.isUniqueIdString(idString)
    }
    return await this.pg.rooms.insert({
      owner_id: userId,
      unique_id: idString
    })
  }

  async latestRoomInvitation(roomId, inviteeEmail) {
    const invitations = await this.pg.room_invitations.find({
      room_id: roomId,
      email: inviteeEmail
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
    return await this.pg.room_invitations.insert({
      room_id: roomId,
      email: inviteeEmail,
      otp: lib.db.otp.generate(),
      issued_at: this.now(),
      expires_at: lib.db.otp.standardExpiration(),
      membership_duration_millis: STANDARD_MEMBERSHIP_DURATION_MILLIS
    })
  }

  async resolveInvitation(invitation, user, otp) {
    const verification = lib.db.otp.verify(invitation, otp)
    if(verification.error != null) {
      return verification
    }

    try {

      const membership = await this.pg.withTransaction(async (tx) => {
        await tx.room_invitations.update({id: invitation.id}, {resolved_at: this.now()})
        return await tx.room_memberships.insert({
          room_id: invitation.room_id,
          user_id: user.id,
          invitation_id: invitation.id,
          began_at: this.now(),
          expires_at: 0 // non-expiring invitations by default
        })
      })

      return { membership }

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    }
  }

  async getOwnedRooms(userId) {
    return await this.pg.rooms.find({
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
    return await this.pg.query(`
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
    const existingEntry = await this.pg.rooms.findOne({unique_id: idString})
    return !existingEntry
  }

  async underMaxOwnedRoomLimit(userId) {
    const count = await this.pg.rooms.count({owner_id: userId})
    return count <= MAX_FREE_ROOMS
  }
}

module.exports = Rooms
