/*
  All the data stored in a room (widgets, participants, wallpaper...)
*/
class RoomData {
  room: any;
  constructor(room) {
    this.room = room;
  }

  get roomId() {
    return this.room.id;
  }

  get urlId() {
    return this.room.urlId;
  }

  get route() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    return shared.db.room.namesAndRoutes.route(this.displayName, this.urlId());
  }

  get displayName() {
    return this.room.displayName;
  }

  async widgets() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    return shared.models.RoomWidget.allInRoom(this.roomId);
  }

  async state() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const entry = await shared.db.room.data.getRoomState(this.roomId);
    return entry.state;
  }

  async wallpaper() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const entry = await shared.db.room.data.getRoomWallpaperData(this.roomId);
    return entry;
  }

  async serialize() {
    const room = {
      id: this.roomId,
      displayName: this.displayName,
      route: this.route,
      urlId: this.urlId,
    };
    const widgetsInRoom = await this.widgets();
    (room as any).widgets = await Promise.all(
      widgetsInRoom.map(async (w) => w.serialize()),
    );
    (room as any).state = (await this.state()) || {};
    (room as any).widgets = (room as any).widgets || [];
    (room as any).wallpaper = await this.wallpaper();
    return room;
  }
}

module.exports = RoomData;
