const DEFAULT_WALLPAPER_URL =
  'https://s3-us-west-2.amazonaws.com/with.wallpapers/farrah_yoo_1609883525.jpg';
const getDefaultRoomState = (room) => {
  return {
    /*
      Not all rooms were created with a default state in dynamo.
      We can later backfill these, and make sure new ones are created with a state.
      Until then, we can just have a default state set in code.
    */
    wallpaperUrl: DEFAULT_WALLPAPER_URL,
    displayName: room && room.displayName ? room.displayName : 'room',
    zOrder: [],
  };
};

class RoomWithState {
  static fromRoomId: any;

  static allVisitableForActorId: any;

  static fromRooms: any;

  _pgRoom: any;
  _roomState: any;

  constructor(pgRoom, roomState) {
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    return shared.db.room.namesAndRoutes.route(
      this.displayName(),
      this.urlId(),
    );
  }

  previewImageUrl() {
    const wallpaperUrl = this._roomState.wallpaperUrl || DEFAULT_WALLPAPER_URL;
    /* Only accept true - must explicitly specify custom */
    if (this._roomState.isCustomWallpaper == true) {
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

RoomWithState.fromRoomId = async (roomId) => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  const pgRoom = await shared.db.room.core.roomById(roomId);
  if (!pgRoom) {
    return null;
  }
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  const routeEntry = await shared.db.room.core.latestMostPreferredRouteEntry(
    roomId,
  );
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  const roomState = await shared.db.room.core.getRoomState(roomId);
  const idRouteEntry =
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    await shared.db.room.namesAndRoutes.getOrCreateUrlIdEntry(roomId);
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 4.
  return new RoomWithState(pgRoom, routeEntry, roomState, idRouteEntry);
};

RoomWithState.allVisitableForActorId = async (actorId) => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  const created = await shared.db.room.core.getCreatedRoutableRooms(actorId);
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  const member = await shared.db.room.core.getMemberRoutableRooms(actorId);
  return {
    created,
    member,
  };
};

RoomWithState.fromRooms = async (rooms) => {
  const statesById = {};
  const result = [];
  const promises = rooms.map(async (room, index) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    let state = await shared.db.room.core.getRoomState(room.id);
    state = state || getDefaultRoomState(room);
    result[index] = new RoomWithState(room, state);
  });
  await Promise.all(promises);
  return result;
};

module.exports = RoomWithState;
