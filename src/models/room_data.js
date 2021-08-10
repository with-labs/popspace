/*
  All the data stored in a room (widgets, participants, wallpaper...)
*/
class RoomData {
  constructor(room) {
    this.room = room;
  }

  get roomId() {
    return this.room.id;
  }

  get displayName() {
    return this.room.displayName;
  }

  async widgets() {
    return shared.models.RoomWidget.allInRoom(this.roomId);
  }

  async state() {
    const entry = await shared.db.room.data.getRoomState(this.roomId);
    return entry.state;
  }

  async wallpaper() {
    const entry = await shared.db.room.data.getRoomWallpaperData(this.roomId);
    return entry;
  }

  async serialize() {
    const room = {
      id: this.roomId,
      displayName: this.displayName,
    };
    const widgetsInRoom = await this.widgets();
    room.widgets = await Promise.all(
      widgetsInRoom.map(async (w) => w.serialize()),
    );
    room.state = (await this.state()) || {};
    room.widgets = room.widgets || [];
    room.wallpaper = await this.wallpaper();
    return room;
  }
}

module.exports = RoomData;
