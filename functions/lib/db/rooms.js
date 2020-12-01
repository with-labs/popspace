const DbAccess = require("./pg/db_access")
const cryptoRandomString = require('crypto-random-string');
const ids = require("./util/ids")
const MAX_FREE_ROOMS = 4
// Never expire by default
const STANDARD_MEMBERSHIP_DURATION_MILLIS = 0

class Rooms extends DbAccess {
  constructor() {
    super()
  }

  /****************************************/
  /************* ROOM     *****************/
  /****************************************/
  async roomById(id) {
    return await db.pg.massive.rooms.findOne({id: id})
  }

  async roomByName(name) {
    const normalized = util.args.normalizeRoomName(name)
    const roomNameEntry = await db.pg.massive.room_names.findOne({name: normalized})
    if(!roomNameEntry) return null;
    return await db.pg.massive.rooms.findOne({id: roomNameEntry.room_id})
  }

  async preferredNameById(id) {
    const names = await db.pg.massive.room_names.find({
      room_id: id
    }, {
      order: [{
        field: "priority_level",
        direction: "desc"
      }],
      limit: 1
    })
    return names[0]
  }

  async namedRoomById(id) {
    const namedRooms = await db.pg.massive.query(`
      SELECT
        rooms.id AS id,
        rooms.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level
      FROM
        rooms LEFT OUTER JOIN room_names on rooms.id = room_names.room_id
      WHERE
        rooms.id = $1
      ORDER BY
        rooms.id ASC
    `, [id])
    return this.namedRoomsListToMostPreferredList(namedRooms)[0]
  }

  async getOwnedRooms(userId) {
    return await db.pg.massive.query(`
      SELECT
        rooms.id AS id,
        rooms.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level
      FROM
        rooms LEFT OUTER JOIN room_names on rooms.id = room_names.room_id
      WHERE
        rooms.owner_id = $1
      ORDER BY
        rooms.id ASC,
        room_names.priority_level DESC
    `, [userId])
  }

  async getMemberRooms(userId) {
    // I.e. rooms you're a member in
    return await db.pg.massive.query(`
      SELECT
        room_names.room_id AS id,
        rooms_and_memberships.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level
      FROM
        (
          SELECT owner_id, room_id
          FROM
            room_memberships LEFT OUTER JOIN rooms
          ON
            room_memberships.room_id = rooms.id
          WHERE
            room_memberships.user_id = $1
            AND
            room_memberships.revoked_at IS NULL
        ) AS rooms_and_memberships
        LEFT OUTER JOIN
          room_names
          on rooms_and_memberships.room_id = room_names.room_id;
    `, [userId])
  }

  async tryToGenerateRoom(userId) {
    const canGenerate = await this.underMaxOwnedRoomLimit(userId)
    if(!canGenerate) {
      return { error : lib.db.ErrorCodes.room.TOO_MANY_OWNED_ROOMS }
    }
    // We may want to add a lock here to avoid race conditions:
    // the check passed, a new request is sent, also passes checks,
    // 2 rooms are created
    return await this.generateRoom(userId)
  }

  async generateRoomId() {
    // NOTE:
    // We want to maintain a relatively low room id string collision rate
    // Collision rate is a product of the randomness space and # of taken slots
    // with a 36-char alphabet of length 5, we get 36^5 or 6 * 10^7 unique ids
    // if we want to maintain a <1% collision rate, we can have 6 * 10^5 entries
    // i.e. 600k rooms
    // At that point we want to bump the length, e.g. 36^6 is 2*10^9 uniques
    let idString = ids.generateId()
    let isUnique = await this.isUniqueIdString(idString)
    while(!isUnique) {
      // TODO: alert if too many collisions
      idString = ids.generateId()
      isUnique = await this.isUniqueIdString(idString)
    }
    return idString
  }

  async generateRoom(userId) {
    const idString = await this.generateRoomId()
    return await this.createRoomWithName(idString, userId)
  }

  async createRoomWithName(name, ownerId=null, priorityLevel = 0, isVanity=false) {
    return await db.pg.massive.withTransaction(async (tx) => {
      const room = await tx.rooms.insert({
        owner_id: ownerId
      })
      const generatedName = await tx.room_names.insert({
        room_id: room.id,
        name: name,
        priority_level: priorityLevel,
        is_vanity: isVanity
      })
      return {
        room: room,
        nameEntry: generatedName
      }
    })
  }


  /*
    Since rooms can have multiple routes/names,
    we may want to convert lists of duplicate rooms with all their names
    into lists that contain just 1 entry for each room - the most preferred name.
  */
  namedRoomsListToMostPreferredList(roomList) {
    let bestById = {}
    for(const room of roomList) {
      const previousBest = bestById[room.id]
      if(!previousBest || room.priority_level > previousBest.priority_level) {
        bestById[room.id] = room
      }
    }
    return Object.values(bestById)
  }

  async ownerByRoomName(roomName) {
    const room = await this.roomByName(roomName)
    if(room) {
      const owner = await db.accounts.userById(room.owner_id)
      return owner
    }
  }

  /****************************************/
  /************* INVITES *****************/
  /****************************************/
  async getInviteUrl(appUrl, invite) {
    // The inivite can happen for existing users, as well as for new users.
    // For new users, it'd be nice if users immediately went to the signup page -
    // however, if the new user registers before the click the invite, we wouldn't
    // like to render the signup page, and so a check is inevitable as they land on it.
    // Thus, it's not really possible to immediately render a signup page for new users,
    // and we must always check whether the user exists before rendering that page.
    const email = util.args.consolidateEmailString(invite.email)
    const roomNameEntry = await this.preferredNameById(invite.room_id)
    return `${appUrl}/join_room?otp=${invite.otp}&iid=${invite.id}&email=${email}&room=${roomNameEntry.name}`
  }

  async getRoomInvites(roomId) {
    return await db.pg.massive.room_invitations.find({
      room_id: roomId,
      resolved_at: null,
      revoked_at: null
    }, {
      order: [{
        field: "created_at",
        direction: "desc"
      }]
    })
  }

  async inviteById(id) {
    return await db.pg.massive.room_invitations.findOne({id: id})
  }

  async activeInvitesByEmailAndRoomId(email, roomId) {
    return await db.pg.massive.room_invitations.find({
      email: email,
      room_id: roomId,
      revoked_at: null
    })
  }

  async latestRoomInvitation(roomId, inviteeEmail) {
    const invitations = await db.pg.massive.room_invitations.find({
      revoked_at: null,
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
      expires_at: lib.db.otp.expirationInNDays(30),
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

  async revokeInvitation(invitationId) {
    return await db.pg.massive.room_invitations.update(
      {id: invitationId},
      {revoked_at: this.now()}
    )
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

  /****************************************/
  /************* MEMBERSHIPS **************/
  /****************************************/
  async isMember(userId, roomId) {
    const membership = await db.pg.massive.room_memberships.findOne({
      user_id: userId,
      room_id: roomId,
      revoked_at: null
    })
    if(!membership) {
      return false
    }
    const current = this.timestamptzStillCurrent(membership.expires_at)
    return current
  }

  async hasAccess(userId, roomId) {
    const room = await this.roomById(roomId)
    if(!room) {
      return false
    }
    if(room.owner_id == userId) {
      return true
    }
    return await this.isMember(userId, roomId)
  }

  async getRoomMembers(roomId) {
    const memberships = await db.pg.massive.room_memberships.find({
      room_id: roomId,
      revoked_at: null
    })
    const userIds = memberships.map((m) => (m.user_id))
    return await db.pg.massive.users.find({id: userIds})
  }

  async revokeMembership(roomId, userId) {
    return await db.pg.massive.room_memberships.update(
      {
        user_id: userId,
        room_id: roomId,
        revoked_at: null
      },
      {revoked_at: this.now()}
    )
  }

  /****************************************/
  /************* CLAIMS *******************/
  /****************************************/
  async getClaimUrl(appUrl, claim) {
    const email = util.args.consolidateEmailString(claim.email)
    return `${appUrl}/claim_room?otp=${claim.otp}&cid=${claim.id}&email=${email}`
  }

  async tryToCreateClaim(email, roomName, allowRegistered=false, createNewRooms=false, allowTransfer=false) {
    email = lib.util.args.consolidateEmailString(email)
    const user = await db.accounts.userByEmail(email)
    if(user) {
      if(allowRegistered) {
        console.log(`Warning: user ${user.email} already registered.`)
      } else {
        return { error: lib.db.ErrorCodes.user.ALREADY_REGISTERED, user: user }
      }
    }

    let roomNameEntry = await db.pg.massive.room_names.findOne({name: roomName})
    if(!roomNameEntry) {
      if(createNewRooms) {
        const priorityLevel = 1
        const isVanity = true
        const ownerId = null
        const createResult =  await this.createRoomWithName(roomName, ownerId, priorityLevel, isVanity)
        roomNameEntry = createResult.nameEntry
      } else {
        return { error: lib.db.ErrorCodes.room.UNKNOWN_ROOM }
      }
    }

    let room = await this.roomById(roomNameEntry.room_id)
    const existingClaim = await db.pg.massive.room_claims.findOne({room_id: room.id})
    if(existingClaim) {
      if(allowTransfer) {
        // Not yet supported
      } else {
        return {
          error: lib.db.ErrorCodes.room.CLAIM_UNIQUENESS,
          claim: existingClaim,
          room: room,
          roomNameEntry: roomNameEntry
        }
      }
    } else {
      const claim = await this.createClaim(room.id, email)
      return { claim, room, roomNameEntry }
    }
  }

  async createClaim(roomId, claimerEmail, expiresAt = null) {
    return await db.pg.massive.room_claims.insert({
      room_id: roomId,
      email: claimerEmail,
      otp: lib.db.otp.generate(),
      issued_at: this.now(),
      expires_at: expiresAt
    })
  }

  async claimUpdateEmailedAt(claimId) {
    return await db.pg.massive.room_claims.update({id: claimId}, {emailed_at: this.now()})
  }

  async resolveClaim(claim, user, otp) {
    const verification = this.isValidInvitation(claim, user.email, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      return await db.pg.massive.withTransaction(async (tx) => {
        await tx.room_claims.update({id: claim.id}, {resolved_at: this.now()})
        return await tx.rooms.update({id: claim.room_id}, {owner_id: user.id})
      })

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    }
  }

  // Private
  async isUniqueIdString(idString) {
    const existingEntry = await db.pg.massive.room_names.findOne({name: idString})
    return !existingEntry
  }

  async underMaxOwnedRoomLimit(userId) {
    const count = await db.pg.massive.rooms.count({owner_id: userId})
    return count < MAX_FREE_ROOMS
  }
}

module.exports = Rooms
