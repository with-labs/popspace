import { Room } from '@prisma/client';

import _room from '../db/room/_room';
import _models from './_models';

/*
  All the data stored in a room (widgets, participants, wallpaper...)
*/
class RoomData {
  room: Room;
  constructor(room: Room) {
    this.room = room;
  }

  get roomId() {
    return this.room.id;
  }

  get urlId() {
    return this.room.urlId;
  }

  get route() {
    return _room.namesAndRoutes.route(this.displayName, this.urlId);
  }

  get displayName() {
    return this.room.displayName;
  }

  async widgets() {
    return _models.RoomWidget.allInRoom(this.roomId);
  }

  async state(): Promise<{ [key: string]: any }> {
    const entry = await _room.data.getRoomState(this.roomId);
    return entry.state ? JSON.parse(entry.state) : {};
  }

  async wallpaper() {
    const entry = await _room.data.getRoomWallpaperData(this.roomId);
    return entry;
  }

  async serialize() {
    return {
      id: this.roomId,
      displayName: this.displayName,
      route: this.route,
      urlId: this.urlId,
      widgets:
        (await Promise.all((await this.widgets()).map((w) => w.serialize()))) ||
        [],
      state: (await this.state()) || {},
      wallpaper: await this.wallpaper(),
    };
  }
}

export default RoomData;
