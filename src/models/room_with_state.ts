import { Prisma, Room, RoomState } from '@prisma/client';

import db from '../db/_index';
import _room from '../db/room/_room';

const DEFAULT_WALLPAPER_URL =
  'https://s3-us-west-2.amazonaws.com/with.wallpapers/farrah_yoo_1609883525.jpg';
const getDefaultRoomState = (room: Room) => {
  return {
    state: {
      /*
        Not all rooms were created with a default state in dynamo.
        We can later backfill these, and make sure new ones are created with a state.
        Until then, we can just have a default state set in code.
      */
      wallpaperUrl: DEFAULT_WALLPAPER_URL,
      displayName: room && room.displayName ? room.displayName : 'room',
      zOrder: [],
    },
  };
};

class RoomWithState {
  // FIXME: this looks horribly inefficient with n+1 queries
  static allVisitableForActorId = async (actorId: bigint) => {
    const created = await db.room.core.getCreatedRoutableRooms(actorId);

    const member = await db.room.core.getMemberRoutableRooms(actorId);
    return {
      created: await Promise.all(
        created.map((r) => RoomWithState.fromRoomId(r.id)),
      ),
      member: await Promise.all(
        member.map((r) => RoomWithState.fromRoomId(r.roomId)),
      ),
    };
  };

  static fromRoomId = async (roomId: bigint) => {
    const pgRoom = await db.room.core.roomById(roomId);
    if (!pgRoom) {
      return null;
    }

    const roomState = await db.room.data.getRoomState(roomId);
    return new RoomWithState(pgRoom, roomState);
  };

  static fromRooms = async (rooms: Room[]) => {
    const result = [];
    const promises = rooms.map(async (room, index) => {
      let state = await db.room.data.getRoomState(room.id);
      state = state || (getDefaultRoomState(room) as any);
      result[index] = new RoomWithState(room, state);
    });
    await Promise.all(promises);
    return result;
  };

  _pgRoom: Room;
  _roomState: RoomState;

  constructor(pgRoom: Room, roomState: RoomState) {
    this._pgRoom = pgRoom;
    this._roomState = roomState;
  }

  roomId() {
    return this._pgRoom.id;
  }

  urlId() {
    return this._pgRoom.urlId;
  }

  creatorId() {
    return this._pgRoom.creatorId;
  }

  displayName() {
    return this._pgRoom.displayName;
  }

  route() {
    return _room.namesAndRoutes.route(this.displayName(), this.urlId());
  }

  roomState() {
    return this._roomState.state as Prisma.JsonObject;
  }

  previewImageUrl() {
    const wallpaperUrl =
      (this.roomState().wallpaperUrl as string) || DEFAULT_WALLPAPER_URL;
    /* Only accept true - must explicitly specify custom */
    if (this.roomState().isCustomWallpaper == true) {
      // For actor-submitted wallpapers, have to render their wallpaper
      return wallpaperUrl;
    } else {
      // For our own wallpapers, we create thumbnails
      const wallpaperUrlComponents = wallpaperUrl.split('/');
      const filename =
        wallpaperUrlComponents[wallpaperUrlComponents.length - 1];
      const filenameComponents = filename.split('.');
      wallpaperUrlComponents.pop();
      return `${wallpaperUrlComponents.join('/')}/${
        filenameComponents[0]
      }_thumb.${filenameComponents[1]}`;
    }
  }

  async serialize() {
    return {
      roomId: this.roomId(),
      creatorId: this.creatorId(),
      previewImageUrl: this.previewImageUrl(),
      displayName: this.displayName(),
      route: this.route(),
      urlId: this.urlId(),
    };
  }
}

export default RoomWithState;
