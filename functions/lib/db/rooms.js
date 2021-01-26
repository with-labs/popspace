const MAX_FREE_ROOMS = 4

// TODO: drop this entire class,
// probably move out the remaining helpers to where they are used
class Rooms {
  constructor() {
  }

  /****************************************/
  /************* ROOM     *****************/
  /****************************************/
  async tryToGenerateRoom(userId) {
    const canGenerate = await this.underMaxOwnedRoomLimit(userId)
    if(!canGenerate) {
      return { error : shared.error.code.TOO_MANY_OWNED_ROOMS }
    }
    // We may want to add a lock here to avoid race conditions:
    // the check passed, a new request is sent, also passes checks,
    // 2 rooms are created
    return await shared.db.rooms.generateRoom(userId)
  }

  /****************************************/
  /************* INVITES *****************/
  /****************************************/
  async getInviteUrl(appUrl, invite) {
    const path = await shared.db.room.invites.getInviteUrlPath(invite)
    return `${appUrl}/${path}`
  }


  /****************************************/
  /************* CLAIMS *******************/
  /****************************************/
  async getClaimUrl(appUrl, claim) {
    const path = await shared.db.room.claims.getClaimUrlPath(claim)
    return `${appUrl}/${path}`
  }


  // Private
  async underMaxOwnedRoomLimit(userId) {
    const count = await shared.db.pg.massive.rooms.count({owner_id: userId})
    return count < MAX_FREE_ROOMS
  }
}

module.exports = Rooms
