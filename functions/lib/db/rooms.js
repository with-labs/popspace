const DbAccess = require("./pg/db_access")
const cryptoRandomString = require('crypto-random-string');
const LOWERCASE_AND_NUMBERS = 'abcdefghijklmnopqrstuvwxyz0123456789'

class Rooms extends DbAccess {
  constructor() {
    super()
    this.otp = new lib.db.Otp()
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

  async getOwnedRooms(userId) {
    return await this.pg.rooms.find({
      owner_id: userId
    })
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
}

module.exports = Rooms
