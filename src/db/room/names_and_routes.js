const cryptoRandomString = require('crypto-random-string');
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const LOWERCASE_AND_NUMBERS = LOWERCASE + NUMBERS

/*
NOTE: On room names and routes
right now, we have several distinct concepts of "name" for a room:
1.) Its routing name
2.) Its display name
3.) Its URL name

Originally 1 and 2 were more tightly coupled, so the pg table for
routes is called "room_names".

The display_name is stored in dynamo.

Routes for user-created rooms are based off the display name.

Perhaps we could move to be more explicit with the room_names table.
Ideally rename it to something like room_routes - but before that,
maybe the code can use "name" and "route" interchangeably, striving
for "route", and displayNames are named explicitly each time.

--------------------------------------------------------------------
ANOTHER NOTE: On route priority levels
There are a few special priority levels that are in play from
before the current naming/routing logic was established.

999 - used to be priority level 0, which stood for randomly-generated
room routes (created from admin panel by inviting someone to own
a With room, w/o specifying the room name explicitly )

999999 - used to be priority level 1, which stood for hand-created
and named room from the admin panel. These are rooms we named manually,
and gave them out.

They are sorted just below the priority levels that are currently
generated, or that are used when the user changes the name for a room.

That way, if users change their initial room names, they'll
lose the vanity URL, but we can always recover it for them,
and we'll be able to easily perform mass operations on them,
if our requirements change.
*/
class NamesAndRoutes {
  constructor() {
    /*
      Right now we store all ways of getting to a room in one place.
      There are vanity rooms, non-vanity/standard rooms,
      and also identifiers that act as a stable part of the URL
      when the display name of a room changes.

      These different kinds of room-route related strings are
      stratified by different priority levels.

      E.g. the standard routes may have some further distinctions
      of preference - though usually it should be fine to use
      the same priority level for all standard routes,
      as it's always possible to fetch the latest one.

      The special priority level for URL IDs is used to
      have a stable ID for the room as its display name changes,
      which we do want to reflect in the URL.

      We do this so that we are under no obligation to keep
      storing the old names/routes in the database, and
      yet all links from the internet to them will continue to work,
      because we can always identify a room by its standard identifier.

      To make fetching it easy, we assign it that special priority level.
      This would also allow for a simple migration to an external store,
      e.g. a key-value store; we'd migrate all the existing routes with
      the special priority level.
    **/
    this.STANDARD_ROOM_ROUTE_PRIORITY_LEVEL = 1000
    this.VANITY_ROOM_ROUTE_PRIORITY_LEVEL = 1000000
    this.URL_ID_AS_ROUTE_PRIORITY_LEVEL = -1
  }

  generateRoute(displayName, urlRoomId) {
    /*
      We distinguish between internal database IDs and object
      identifiers visible to users through e.g. routes: that's urlRoomId.
    */
    /*
      For am empty urlName, stil add a prefix. Currently
      more an artifact of the data model, we can't have
      routes be identical to urlRoomIds.

      If we extract urlRoomIds to their own data store,
      we can have empty-named routes with just Ids.
    */
    const urlName = this.getUrlName(displayName)
    if(urlName.length > 0) {
      return `${urlName}-${urlRoomId}`
    } else {
      return`room-${urlRoomId}`
    }

  }

  async getOrCreateUrlIdEntry(roomId) {
    /*
      For now, we can keep track of a room's ID by just writing
      it to the room_names table with a special priority (-1).
      For example, after that free generated IDs can be priority 1000+,
      and vanity rooms 1000000+.

      If we want to migrate to something more efficient eventually,
      the url IDs should probably not be in postgres at all -
      we'd move them out to e.g. a persistent redis for O(1) access.
      For now I don't want to worry about that, and we don't have
      access to redis from netlify, and performance is not a concern.

      If we want to drop the multi-room paradigm - that would be very easy too.
      We could simply remove all room_names but the one with the latest
      created_at, stop writing room_names each time the room is changed,
      and instead update or replace the record. Assuming the rest of
      our route resolution already relies on just the room's URL ID by then
      (which is arguably the point of that type of migration),
      we won't even lose access to the old routes, because
      we're already respecting that URL schema.
    */
    const existingEntry = await shared.db.pg.massive.room_names.findOne({
      room_id: roomId,
      priority_level: this.URL_ID_AS_ROUTE_PRIORITY_LEVEL
    })
    if(existingEntry) {
      return existingEntry
    }
    if(!existingEntry) {
      const urlId = await this.generateUniqueRoomUrlId()
      const roomUrlIdEntry = await shared.db.pg.massive.room_names.insert({
        room_id: roomId,
        name: urlId,
        priority_level: this.URL_ID_AS_ROUTE_PRIORITY_LEVEL,
        is_vanity: false
      })
      return roomUrlIdEntry
    }
  }

  async generateUniqueRoomUrlId() {
    // NOTE:
    // We want to maintain a relatively low room id string collision rate
    // Collision rate is a product of the randomness space and # of taken slots
    // with a 36-char alphabet of length 5, we get 36^5 or 6 * 10^7 unique ids
    // if we want to maintain a <1% collision rate, we can have 6 * 10^5 entries
    // i.e. 600k rooms
    // At that point we want to bump the length, e.g. 36^6 is 2*10^9 uniques
    let idString = this.generateRoomId()
    let isUnique = await this.isUniqueIdString(idString)
    while(!isUnique) {
      // TODO: alert if too many collisions
      idString = this.generateRoomId()
      isUnique = await this.isUniqueIdString(idString)
    }
    return idString
  }

  getNormalizedDisplayName(displayName) {
    return shared.lib.args.multiSpaceToSingleSpace(displayName.trim())
  }

  getNormalizedRoomRoute(roomRoute) {
    // DEPRECATED
    // We don't really need this, since getUrlName covers the case of routes
    // being used as names.
    return shared.lib.args.multiDashToSingleDash(roomRoute.trim().toLowerCase())
  }

  getUrlName(displayName) {
    const normalized = this.getNormalizedDisplayName(displayName).toLowerCase()
    // Don't need to replace the A-Z range since we're already normalized.
    // Also we're allowing dashes so that names that look like our routes
    // remain stable, e.g. "room-123" -> "room-123", not "room123"
    const noSpecialCharacters = normalized.replace(/[^a-z0-9 -]/g, "")
    const spacesAsDashes = noSpecialCharacters.trim().replace(/ /g, "-")
    // Clean up double-dashes AFTER spaces have been replaced with dashes
    const noDoubleDashes = shared.lib.args.multiDashToSingleDash(spacesAsDashes)
    return noDoubleDashes
  }

  // Private
  generateRoomId() {
    /*
      Generates an ID using a schema of characters and digits.

      Schemas are encoded as strings; c stands for "character or number", d stands for "digit".

      We'll care to know what the chance of generating an ID that already exists.

      For example,
        dccdccd.
      How many unique IDs?

      D * N * N * D * N * N * D = D ^ 3 * N ^ 4

      Where N is number of characters, D - digits.

      So for 10 digits, 26 characters:

      10^3 * 26^4 = 2.6^4 * 10^4 ~ 45 * 10^4 = 4.5 * 10^5

      Let's allow c be digit or character

      10 ^ 3 * 36 ^ 4 = 1.67 * 10^7

      Suppose we want a 0.1% collision rate, i.e. 1/1000th previously seen.
      After which point do various schemas start having worse than 0.1% collisios?

      10^5/ 10^3 = 100 names
      10^7/ 10^3 = 10000 names
      ideally we'd want more like 100000 names
    */
    // If we have 24 digits, we have 10^24 names, so 1/1000 collision up to 10^21 names
    // should be enough!
    const length = 24
    let schema = "c"
    while(schema.length < length) {
      schema += Math.random() < 0.5 ? "c" : "d"
    }
    return this.roomIdFromSchema(schema)
  }

  roomIdFromSchema(schema) {
    let result = ""
    for(const char of schema) {
      switch(char) {
        case "c":
          result += cryptoRandomString({length: 1, characters: LOWERCASE});
          break
        case "d":
          result += cryptoRandomString({length: 1, characters: NUMBERS})
          break
        case "a":
          result += cryptoRandomString({length: 1, characters: LOWERCASE_AND_NUMBERS})
          break
      }
    }
    return result
  }

  async isUniqueIdString(idString) {
    const existingEntry = await shared.db.pg.massive.room_names.findOne({name: idString})
    return !existingEntry
  }
}

module.exports = new NamesAndRoutes()
