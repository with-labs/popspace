/*
  All the data stored in a room (widgets, participants, wallpaper...)
*/
class RoomData {
  constructor(room) {
    this.room = room
  }

  get roomId() {
    return this.room.id
  }

  get urlId() {
    return this.room.url_id
  }

  get route() {
    return shared.db.room.namesAndRoutes.route(this.displayName, this.urlId())
  }

  get displayName() {
    return this.room.display_name
  }

  async widgets() {
    return shared.models.RoomWidget.allInRoom(this.roomId)
  }

  async state() {
    const entry = await shared.db.room.data.getRoomState(this.roomId)
    return entry.state
  }

  async wallpaper() {
    const entry = await shared.db.room.data.getRoomWallpaperData(this.roomId)
    return entry
  }

  async serialize() {
    const room = {
      id: this.roomId,
      display_name: this.displayName
      route: this.route,
      url_id: this.urlId
    }
    const widgetsInRoom = await this.widgets()
    room.widgets = await Promise.all(
      widgetsInRoom.map(async (w) => (w.serialize()))
    )
    room.state = await this.state() || {}
    room.widgets = room.widgets || []
    room.wallpaper = await this.wallpaper()
    return room
  }
}

module.exports = RoomData
