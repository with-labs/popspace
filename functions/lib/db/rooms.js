// TODO: drop this entire class,
// probably move out the remaining helpers to where they are used
class Rooms {
  constructor() {
  }

  async getInviteUrl(appUrl, invite) {
    const path = await shared.db.room.invites.getInviteUrlPath(invite)
    return `${appUrl}/${path}`
  }

  async getClaimUrl(appUrl, claim) {
    const path = await shared.db.room.claims.getClaimUrlPath(claim)
    return `${appUrl}/${path}`
  }
}

module.exports = Rooms
