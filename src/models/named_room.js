const DEFAULT_WALLPAPER_URL = "https://s3-us-west-2.amazonaws.com/with.wallpapers/farrah_yoo_1609883525.jpg"
const getDefaultRoomState = (roomWithRoute) => {
  return {  /*
      Not all rooms were created with a default state in dynamo.
      We can later backfill these, and make sure new ones are created with a state.
      Until then, we can just have a default state set in code.
    */
    wallpaper_url: DEFAULT_WALLPAPER_URL,
    /*
      Note: keep this false to show thumbnail in dashboard vs full image
    */
    is_custom_wallpaper: false,
    bounds: { width: 2400, height: 2400 },
    display_name: roomWithRoute && roomWithRoute.name ? roomWithRoute.name : "room",
    z_order: []
  }
}



class NamedRoom {
  constructor(pgRoom, routeEntry, roomState, idRouteEntry) {
    this._pgRoom = pgRoom
    this._routeEntry = routeEntry
    this._roomState = roomState
    this._idRouteEntry = idRouteEntry
  }

  roomId() {
    return this._pgRoom.id
  }

  ownerId() {
    return this._pgRoom.owner_id
  }

  displayName() {
    /*
     TODO: At some point we should backfill old rooms and
     Have only one possible source of truth.
     When all rooms have a room state in dynamo,
     and all rooms states have a display name -
     we can drop the fallback here.
     The room create logic should ensure all new rooms have
     a state and a display state.
    */
    return this._roomState.display_name || this._routeEntry.name
  }

  route() {
    return this._routeEntry.name
  }

  previewImageUrl() {
    const wallpaperUrl = this._roomState.wallpaper_url || DEFAULT_WALLPAPER_URL
    /* Only accept true - must explicitly specify custom */
    if(this._roomState.is_custom_wallpaper == true) {
      // For user-submitted wallpapers, have to render their wallpaper
      return wallpaperUrl
    } else {
      // For our own wallpapers, we create thumbnails
      const wallpaperUrlComponents = wallpaperUrl.split("/")
      const filename = wallpaperUrlComponents[wallpaperUrlComponents.length - 1]
      const filenameComponents = filename.split(".")
      wallpaperUrlComponents.pop()
      return `${wallpaperUrlComponents.join("/")}/${filenameComponents[0]}_thumb.${filenameComponents[1]}`
    }
  }

  urlId() {
    if(this._idRouteEntry) {
      return this._idRouteEntry.name
    }
  }

  serialize() {
    return {
      room_id: this.roomId(),
      owner_id: this.ownerId(),
      preview_image_url: this.previewImageUrl(),
      display_name: this.displayName(),
      route: this.route(),
      url_id: this.urlId()
      /*
        Should we include the public invite URL here?
        Perhaps not?
        E.g. it would be more current if it were fetched as it's
        about to be edited, if someone in the room enables it.
      */
    }
  }
}

NamedRoom.fromRoomId = async (roomId) => {
  const pgRoom = await shared.db.rooms.roomById(roomId)
  if(!pgRoom) {
    return null
  }
  const routeEntry = await shared.db.rooms.latestMostPreferredRouteEntry(roomId)
  const roomState = await shared.db.dynamo.room.getRoomState(roomId)
  const idRouteEntry = await shared.db.room.namesAndRoutes.getOrCreateUrlIdEntry(roomId)
  return new NamedRoom(pgRoom, routeEntry, roomState, idRouteEntry)
}

NamedRoom.allVisitableForUserId = async (userId) => {
  const ownedWithRoute = await shared.db.rooms.getOwnedRooms(userId)
  const memberedWithRoute = await shared.db.rooms.getMemberRooms(userId)
  const allVisitableWithRoute = [...ownedWithRoute, ...memberedWithRoute]
  return await NamedRoom.preferredFromRoomsWithRoute(allVisitableWithRoute)
}

NamedRoom.preferredFromRoomsWithRoute = async (roomsWithRoute) => {
  /*
    Note: if we had a more powerful psql queries (i.e. fetch only) most preferred route entries
    - we wouldn't have to do this little dance.
    Perhaps it's worth figuring out - though maybe in practice it wouldn't be more performant?
  */
  const preferred = shared.db.rooms.namedRoomsListToMostPreferredList(roomsWithRoute)
  return NamedRoom.fromRoomsWithRoute(preferred)
}

NamedRoom.fromRoomsWithRoute = async (roomsWithRoute) => {
  const statesById = {}
  const result = []
  const promises = roomsWithRoute.map(async (roomWithRoute, index) => {
    let state = await shared.db.dynamo.room.getRoomState(roomWithRoute.id)
    state = state || getDefaultRoomState(roomWithRoute)
    let idRouteEntry = await shared.db.room.namesAndRoutes.getOrCreateUrlIdEntry(roomWithRoute.id)
    result[index] = new NamedRoom(roomWithRoute, roomWithRoute, state, idRouteEntry)
  })
  await Promise.all(promises)
  return result
}

module.exports = NamedRoom
