import cryptoRandomString from 'crypto-random-string';

import args from '../../lib/args';
import prisma from '../prisma';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const LOWERCASE_AND_NUMBERS = LOWERCASE + NUMBERS;

/*
There are several "names" of a room:
1.) Its route
2.) Its display name
3.) Its URL name
4.) Its URL identifier

The route of a room always looks like "/room-url-name-url_id_12345"
The url name is derived from the display name - converting spaces to dashes,
lowercasing, removing special characters...

When the room is renamed, the route changes - though old routes remain valid.

A room is only really matched by its url ID - a user-facing static
identifier for the room.

It's distinct from the indexing identifier which is used to query rooms.
URL IDs don't reveal information about how many rooms we have,
are harder to brute force, and re-oxygenate the internet at night.
*/
export class NamesAndRoutes {
  constructor() {}

  roomToRoute(room) {
    return this.route(room.displayName, room.urlId);
  }

  /*
    A route always looks like "/room-url-name-url_id_12345"

    The room-url-name is derived from displayName
    urlRoomId is a unique user-facing static identifier of the room,
  */
  route(displayName: string, urlRoomId: string) {
    /*
      For am empty urlName, stil add a prefix. Currently
      more an artifact of the data model, we can't have
      routes be identical to urlRoomIds.

      If we extract urlRoomIds to their own data store,
      we can have empty-named routes with just Ids.
    */
    const urlName = this.getUrlName(displayName);
    if (urlName.length > 0) {
      return `${urlName}-${urlRoomId}`;
    } else {
      return `room-${urlRoomId}`;
    }
  }

  urlIdFromRoute(route: string) {
    /*
      If a route is like display-name-hey-id12345,
      we can get the last element after a dash.
    */
    return route.split('-').pop();
  }

  async generateUniqueRoomUrlId() {
    // NOTE:
    // We want to maintain a relatively low room id string collision rate
    // Collision rate is a product of the randomness space and # of taken slots
    // with a 36-char alphabet of length 5, we get 36^5 or 6 * 10^7 unique ids
    // if we want to maintain a <1% collision rate, we can have 6 * 10^5 entries
    // i.e. 600k rooms
    // At that point we want to bump the length, e.g. 36^6 is 2*10^9 uniques
    let idString = this.generateRoomId();
    let isUnique = await this.isUniqueIdString(idString);
    let iterations = 0;
    while (!isUnique) {
      idString = this.generateRoomId();
      isUnique = await this.isUniqueIdString(idString);
      iterations++;
      if (iterations == 101) {
        // FIXME: don't rely on some global 'log' variable which may not exist
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
        log.error.warn('Over 100 iterations genereating unique room ID...');
      }
      if (iterations == 1001) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
        log.error.error('Over 1000 iterations genereating unique room ID...');
      }
    }
    return idString;
  }

  getNormalizedDisplayName(displayName: string) {
    return args.multiSpaceToSingleSpace(displayName.trim());
  }

  /*
    A URL name is a version of a display name that is
    lowercased, trimmed, has spaced converted to dashes
    and special characters removed
  */
  getUrlName(displayName: string) {
    const normalized = this.getNormalizedDisplayName(displayName).toLowerCase();
    // Don't need to replace the A-Z range since we're already normalized.
    // Also we're allowing dashes so that names that look like our routes
    // remain stable, e.g. "room-123" -> "room-123", not "room123"
    const noSpecialCharacters = normalized.replace(/[^a-z0-9 -]/g, '');
    const spacesAsDashes = noSpecialCharacters.trim().replace(/ /g, '-');
    // Clean up double-dashes AFTER spaces have been replaced with dashes
    const noDoubleDashes = args.multiDashToSingleDash(spacesAsDashes);
    return noDoubleDashes;
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
    const length = 24;
    let schema = 'c';
    while (schema.length < length) {
      schema += Math.random() < 0.5 ? 'c' : 'd';
    }
    return this.roomIdFromSchema(schema);
  }

  roomIdFromSchema(schema: string) {
    let result = '';
    for (const char of schema) {
      switch (char) {
        case 'c':
          result += cryptoRandomString({ length: 1, characters: LOWERCASE });
          break;
        case 'd':
          result += cryptoRandomString({ length: 1, characters: NUMBERS });
          break;
        case 'a':
          result += cryptoRandomString({
            length: 1,
            characters: LOWERCASE_AND_NUMBERS,
          });
          break;
      }
    }
    return result;
  }

  async isUniqueIdString(idString: string) {
    const existingEntry = await prisma.room.findUnique({
      where: { urlId: idString },
    });
    return !existingEntry;
  }
}

export default new NamesAndRoutes();
