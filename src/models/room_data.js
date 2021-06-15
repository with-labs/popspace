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

  get displayName() {
    return this.room.display_name
  }

  async widgets() {
    return shared.models.RoomWidget.allInRoom(this.roomId)
  }

  async state() {
    return shared.db.room.data.getRoomState(this.roomId)
  }

  async serialize() {
    const room = {
      id: this.roomId,
      display_name: this.displayName
    }
    const widgetsInRoom = await this.widgets()
    room.widgets = await Promise.all(
      widgetsInRoom.map(async (w) => (w.serialize()))
    )
    room.state = await this.state()
    return room
  }
}

module.exports = RoomData
