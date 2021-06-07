class Rooms {
  constructor() {
  }

  /********************* GETTERS *******************/
  async roomById(id) {
    return await shared.db.pg.massive.rooms.findOne({id: id, deleted_at: null})
  }

  async roomByName(name) {
    // DEPRECATED, prefer roomByRoute
    return this.roomByRoute(name)
  }

  async roomByRoute(route) {
    const normalized = shared.db.room.namesAndRoutes.getNormalizedRoomRoute(route)
    const roomNameEntry = await shared.db.pg.massive.room_names.findOne({name: normalized})
    if(!roomNameEntry) return null;
    return await shared.db.rooms.roomById(roomNameEntry.room_id)
  }

  async roomByRouteOrUrlIdOrRoomId(route, urlId, roomId) {
    /*
      We should strive to avoid using routes, and
      prefer either the roomId or the urlId.
      While we're in transition I want to make it super easy
      to find references to outdated code.
      At some point we'll drop support for roomIds,
      and replace all instances of this method with either
      routes or urlIds - depending on what we decide.
    */
    if(route) {
      return await shared.db.rooms.roomByRoute(route)
    } else if(urlId) {
      return await shared.db.rooms.roomByRoute(urlId)
    } else if(roomId) {
      return await shared.db.rooms.roomById(roomId)
    }
  }

  async preferredNameById(id) {
    // DEPRECATED, prefer preferredRouteById
    return this.preferredRouteById(id)
  }

  async preferredRouteById(id) {
    const names = await shared.db.pg.massive.room_names.find({
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

  async latestMostPreferredRouteEntry(roomId) {
    /*
      Each room have have multiple routes.
      Each route has a priority_level - but we can have many routes with the
      same priority_level.

      So we can choose the latest of the routes with the highest priority.
    */
    const routeEntries = await shared.db.pg.massive.room_names.find(
      {room_id: roomId},
      {
        order: [
          // Get the highest priority_level entry possible
          {field: 'priority_level', direction: 'desc'},
          // If there are many, choose the latest entry
          {field: 'created_at', direction: 'desc'}
        ],
        limit: 1
      }
    )
    return routeEntries[0]
  }

  async namedRoomById(id) {
    // DEPRECATED, prefer routableRoomById
    return await this.routableRoomById(id)
  }

  async routableRoomById(id) {
    const namedRooms = await shared.db.pg.massive.query(`
      SELECT
        rooms.id AS id,
        rooms.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level,
        room_names.created_at
      FROM
        rooms LEFT OUTER JOIN room_names on rooms.id = room_names.room_id
      WHERE
        rooms.id = $1
        AND
        rooms.deleted_at IS NULL
      ORDER BY
        rooms.id DESC
    `, [id])
    return this.namedRoomsListToMostPreferredList(namedRooms)[0]
  }

  async getOwnedRooms(userId) {
    // DEPRECATED, prefer getOwnedRoutableRooms
    return await this.getOwnedRoutableRooms(userId)
  }

  async getOwnedRoutableRooms(userId) {
    return await shared.db.pg.massive.query(`
      SELECT
        rooms.id AS id,
        rooms.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level,
        room_names.created_at AS created_at
      FROM
        rooms LEFT OUTER JOIN room_names on rooms.id = room_names.room_id
      WHERE
        rooms.owner_id = $1
        AND
        rooms.deleted_at IS NULL
      ORDER BY
        rooms.id DESC,
        room_names.priority_level DESC
    `, [userId])
  }

  async getMemberRooms(userId) {
    // DEPRECATED, prefer getMemberRoutableRooms
    return await this.getMemberRoutableRooms(userId)
  }

  async getMemberRoutableRooms(userId) {
    // I.e. rooms you're a member in
    return await shared.db.pg.massive.query(`
      SELECT
        room_names.room_id AS id,
        rooms_and_memberships.owner_id AS owner_id,
        room_names.name AS name,
        room_names.priority_level AS priority_level,
        room_names.created_at AS created_at
      FROM
        (
          SELECT owner_id, room_id, room_memberships.created_at as member_as_of
          FROM
            room_memberships LEFT OUTER JOIN rooms
          ON
            room_memberships.room_id = rooms.id
          WHERE
            room_memberships.user_id = $1
            AND
            room_memberships.revoked_at IS NULL
            AND
            rooms.deleted_at IS NULL
        ) AS rooms_and_memberships
        LEFT OUTER JOIN
          room_names
          on rooms_and_memberships.room_id = room_names.room_id
        ORDER BY rooms_and_memberships.member_as_of DESC;
    `, [userId])
  }

  namedRoomsListToMostPreferredList(routableRoomList) {
    return this.routableRoomsListToMostPreferredList(routableRoomList)
  }
  /*
    Since rooms can have multiple routes/names,
    we may want to convert lists of duplicate rooms with all their names
    into lists that contain just 1 entry for each room - the most preferred name.
  */
  namedRoomsListToMostPreferredList(routableRoomList) {
    let bestById = {}
    for(const room of routableRoomList) {
      const previousBest = bestById[room.id]
      if(!previousBest) {
        bestById[room.id] = room
      } else {
        const isHigherPriority = room.priority_level > previousBest.priority_level
        const isSamePriorityButNewer =
          room.priority_level == previousBest.priority_level &&
          shared.db.time.isTimestamptzAfter(room.created_at, previousBest.created_at)
        if(isHigherPriority || isSamePriorityButNewer) {
          bestById[room.id] = room
        }
      }
    }
    /*
      To preserve any pre-existing sorting,
      manually compose the result vs Object.values(bestById)
    */
    const result = []
    for(const room of routableRoomList) {
      if(bestById[room.id] == room) {
        result.push(room)
      }
    }
    return result
  }

  async ownerByRoomName(roomName) {
    // DEPRECATED, prefer ownerByRoomRoute
    return this.ownerByRoomRoute(roomName)
  }

  async ownerByRoomRoute(roomRoute) {
    const room = await this.roomByName(roomName)
    if(room) {
      const owner = await shared.db.accounts.userById(room.owner_id)
      return owner
    }
  }


  /*********************************** MODIFIERS ****************************/
  async generateRoom(userId, empty=false) {
    return this.createRoomFromDisplayName("", userId, empty)
  }

  async createRoomFromDisplayName(displayName, ownerId, empty) {
    /*
      When a user creates a room, they enter a display name.
      We transform that display name into a route.
    */
    const urlId = await shared.db.room.namesAndRoutes.generateUniqueRoomUrlId()
    const urlName = shared.db.room.namesAndRoutes.generateRoute(displayName, urlId)
    const result = await shared.db.pg.massive.withTransaction(async (tx) => {
      const room = await tx.rooms.insert({
        owner_id: ownerId
      })
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
      const roomUrlIdEntry = await tx.room_names.insert({
        room_id: room.id,
        name: urlId,
        priority_level: shared.db.room.namesAndRoutes.URL_ID_AS_ROUTE_PRIORITY_LEVEL,
        is_vanity: false
      })
      const roomNameEntry = await tx.room_names.insert({
        room_id: room.id,
        name: urlName,
        priority_level: shared.db.room.namesAndRoutes.STANDARD_ROOM_ROUTE_PRIORITY_LEVEL,
        is_vanity: false
      })
      return {
        room: room,
        roomNameEntry: roomNameEntry,
        urlIdEntry: roomUrlIdEntry
      }
    })
    if(empty) {
      result.roomData = await shared.db.room.defaults.setUpEmptyRoom(result.room.id, displayName)
    } else {
      result.roomData = await shared.db.room.defaults.setUpDefaultRoomData(result.room.id, displayName)
    }

    return result
  }

  async setDisplayName(roomId, newDisplayName) {
    const urlIdEntry = await shared.db.room.namesAndRoutes.getOrCreateUrlIdEntry(roomId)
    const normalizedDisplayName = shared.db.room.namesAndRoutes.getNormalizedDisplayName(newDisplayName)
    const urlName = shared.db.room.namesAndRoutes.generateRoute(normalizedDisplayName, urlIdEntry.name)
    // Maybe we're renaming to a name it's already had?
    let roomRouteEntry = await shared.db.pg.massive.room_names.findOne({
      room_id: roomId,
      name: urlName
    })
    if(roomRouteEntry)  {
      const newCreatedAt = shared.db.time.now()
      await shared.db.pg.massive.room_names.update({room_id: roomId, name: urlName}, {
        /*
          Pretend this is the latest entry... we lose some history,
          but I don't want to introduce a special column like "last_used_at"
          to identify the "latest" room entry among equal priority entries
        */
        created_at: newCreatedAt
      })
      roomRouteEntry.created_at = newCreatedAt
    } else {
      roomRouteEntry = await shared.db.pg.massive.room_names.insert({
        room_id: roomId,
        name: urlName,
        priority_level: shared.db.room.namesAndRoutes.STANDARD_ROOM_ROUTE_PRIORITY_LEVEL,
        is_vanity: false
      })
    }
    await shared.db.dynamo.room.updateRoomState(roomId, {display_name: normalizedDisplayName})
    return {
      routeEntry: roomRouteEntry,
      urlIdEntry: urlIdEntry,
      assignedDisplayName: normalizedDisplayName
    }
  }

  async deleteRoom(roomId) {
    await shared.db.pg.massive.rooms.update({id: roomId}, {deleted_at: shared.db.time.now()})
  }

  async restoreRoom(roomId) {
    await shared.db.pg.massive.rooms.update({id: roomId}, {deleted_at: null})
  }

  async createRoomWithRoute(route, ownerId=null, priorityLevel = 0, isVanity=false) {
    /*
      Directly assigns a route to a room (as long as it's available)
    */
    return await shared.db.pg.massive.withTransaction(async (tx) => {
      const room = await tx.rooms.insert({
        owner_id: ownerId
      })
      const roomNameEntry = await tx.room_names.insert({
        room_id: room.id,
        name: route,
        priority_level: priorityLevel,
        is_vanity: isVanity
      })
      return {
        room: room,
        roomNameEntry: roomNameEntry
      }
    })
  }


}

module.exports = new Rooms()
