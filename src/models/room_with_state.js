const DEFAULT_WALLPAPER_URL = "https://s3-us-west-2.amazonaws.com/with.wallpapers/farrah_yoo_1609883525.jpg"
const getDefaultRoomState = (room) => {
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
    display_name: room && room.display_name ? room.display_name : "room",
    z_order: []
  }
}

class RoomWithState {
  constructor(pgRoom, roomState) {
    this._pgRoom = pgRoom
    this._roomState = roomState
  }

  roomId() {
    return this._pgRoom.id
  }

  urlId() {
    return this._pgRoom.url_id
  }

  creatorId() {
    return this._pgRoom.creator_id
  }

  displayName() {
    return this._pgRoom.display_name
  }

  route() {
    return shared.db.room.namesAndRoutes.route(this.displayName(), this.urlId())
  }

  previewImageUrl() {
    const wallpaperUrl = this._roomState.wallpaper_url || DEFAULT_WALLPAPER_URL
    /* Only accept true - must explicitly specify custom */
    if(this._roomState.is_custom_wallpaper == true) {
      // For actor-submitted wallpapers, have to render their wallpaper
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

  async serialize() {
    return {
      room_id: this.roomId(),
      creator_id: this.creatorId(),
      preview_image_url: this.previewImageUrl(),
      display_name: this.displayName(),
      route: this.route(),
      url_id: this.urlId(),
    }
  }
}

RoomWithState.fromRoomId = async (roomId) => {
  const pgRoom = await shared.db.room.core.roomById(roomId)
  if(!pgRoom) {
    return null
  }
  const routeEntry = await shared.db.room.core.latestMostPreferredRouteEntry(roomId)
  const roomState = await shared.db.room.core.getRoomState(roomId)
  const idRouteEntry = await shared.db.room.namesAndRoutes.getOrCreateUrlIdEntry(roomId)
  return new RoomWithState(pgRoom, routeEntry, roomState, idRouteEntry)
}

RoomWithState.allVisitableForActorId = async (actorId) => {
  const created = await shared.db.room.core.getCreatedRoutableRooms(actorId)
  const member = await shared.db.room.core.getMemberRoutableRooms(actorId)
  return {
    created,
    member
  }
}

RoomWithState.fromRooms = async (rooms) => {
  const statesById = {}
  const result = []
  const promises = rooms.map(async (room, index) => {
    let state = await shared.db.room.core.getRoomState(room.id)
    state = state || getDefaultRoomState(room)
    result[index] = new RoomWithState(room, state)
  })
  await Promise.all(promises)
  return result
}

module.exports = RoomWithState
