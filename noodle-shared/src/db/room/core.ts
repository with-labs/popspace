import _error from '../../error/_error';
import password from '../../lib/password';
import prisma from '../prisma';
import time from '../time';
import names_and_routes, {
  MAX_VANITY_ROUTE_LENGTH,
  MIN_VANITY_ROUTE_LENGTH,
} from './names_and_routes';
import templates from './templates';

const MAX_ROOM_DISPLAY_NAME_LENGTH = 100;

export type VanityRouteCheck = {
  route: string;
  available: boolean;
  reason?: 'invalid' | 'reserved' | 'taken';
};

const roomNameError = (message: string, errorCode: string) => {
  const error: any = new Error(message);
  error.errorCode = errorCode;
  return error;
};

export class Core {
  constructor() {}

  /********************* GETTERS *******************/
  async roomById(id: number) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room || room.deletedAt) return null;
    return room;
  }

  async roomByUrlId(urlId: string) {
    const room = await prisma.room.findUnique({ where: { urlId } });
    if (!room || room.deletedAt) return null;
    return room;
  }

  async roomByRoute(route: string) {
    // custom names an admin picked take priority over generated routes
    const vanityRoute = await prisma.roomRoute.findUnique({
      where: { route: route.toLowerCase() },
    });
    if (vanityRoute && vanityRoute.isVanity) {
      return await this.roomById(vanityRoute.roomId);
    }
    const urlId = names_and_routes.urlIdFromRoute(route);
    return await this.roomByUrlId(urlId);
  }

  /** Every room that isn't deleted, newest first, for room management */
  async listRoomsForAdmin() {
    const rooms = await prisma.room.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        urlId: true,
        displayName: true,
        templateName: true,
        passwordHash: true,
        createdAt: true,
        routes: { where: { isVanity: true }, select: { route: true } },
      },
      orderBy: { id: 'desc' },
    });
    return rooms.map((room) => ({
      roomId: room.id,
      urlId: room.urlId,
      displayName: room.displayName,
      templateName: room.templateName,
      passwordProtected: !!room.passwordHash,
      createdAt: room.createdAt,
      vanityRoute: room.routes[0]?.route || null,
      route: names_and_routes.route(room.displayName || '', room.urlId),
    }));
  }

  /**
   * Whether a custom name can become a room's route.
   * @param {number} roomId - the room being renamed, so it can keep its own name
   */
  async checkVanityRoute(
    name: string,
    roomId: number | null = null,
  ): Promise<VanityRouteCheck> {
    const route = names_and_routes.vanityRouteFromName(name);
    if (
      route.length < MIN_VANITY_ROUTE_LENGTH ||
      route.length > MAX_VANITY_ROUTE_LENGTH
    ) {
      return { route, available: false, reason: 'invalid' };
    }
    if (names_and_routes.isReservedVanityRoute(route)) {
      return { route, available: false, reason: 'reserved' };
    }
    const existing = await prisma.roomRoute.findUnique({ where: { route } });
    if (existing && existing.roomId !== roomId) {
      return { route, available: false, reason: 'taken' };
    }
    // a vanity route ending in a room's url id would hijack that room's links
    const shadowedRoom = await prisma.room.findUnique({
      where: { urlId: names_and_routes.urlIdFromRoute(route) },
    });
    if (shadowedRoom) {
      return { route, available: false, reason: 'taken' };
    }
    return { route, available: true };
  }

  async routableRoomById(id: number) {
    /*
      TODO: At this point, this should return a model,
      or be deleted altogether - perhaps a model constructor
      would work better
    */
    return this.roomById(id);
  }

  getCreatedRoutableRooms(actorId: number) {
    return prisma.room.findMany({
      select: {
        id: true,
        creatorId: true,
        displayName: true,
        urlId: true,
      },
      where: {
        creatorId: actorId,
        deletedAt: null,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getMemberRoutableRooms(actorId: number) {
    const records = await prisma.roomMembership.findMany({
      where: {
        actorId,
        revokedAt: null,
        room: {
          deletedAt: null,
        },
      },
      select: {
        roomId: true,
        createdAt: true,
        room: {
          select: {
            displayName: true,
            creatorId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // FIXME: this renaming isn't necessary and introduces
    // inconsistency, refactor it out
    return records.map((record) => {
      return {
        roomId: record.roomId,
        memberAsOf: record.createdAt,
        displayName: record.room.displayName,
        creatorId: record.room.creatorId,
      };
    });
  }

  /*********************************** MODIFIERS ****************************/
  /**
   * Create a room using provided template data.
   * @param {TemplateData} template
   * @param {number} creatorId - may be deprecated as we move to anon actors
   */
  async createRoomFromTemplate(
    templateName: string,
    template: any,
    creatorId: number,
    isPublic = true,
  ) {
    let templateData = template;
    if (!templateData) {
      const templateRow = await prisma.roomTemplate.findUnique({
        where: { name: templateName },
      });
      if (!templateRow) {
        throw new Error(`No template found for name ${templateName}`);
      }
      templateData = JSON.parse(templateRow.data);
    }
    const room = await this.createRoom(
      creatorId,
      templateData.displayName || 'New Meeting',
      templateName,
      isPublic,
    );
    const roomData = await templates.setUpRoomFromTemplate(
      room.id,
      templateData,
    );
    return { room, roomData };
  }

  async createRoom(
    creatorId: number,
    displayName: string,
    templateName: string,
    isPublic = true,
  ) {
    const urlId = await names_and_routes.generateUniqueRoomUrlId();
    const room = await prisma.room.create({
      data: {
        creatorId,
        isPublic,
        urlId,
        displayName,
        templateName,
      },
    });
    return room;
  }

  async createEmptyRoom(
    creatorId: number,
    isPublic: boolean,
    displayName: string,
  ) {
    return this.createRoomFromTemplate(
      'empty',
      templates.empty(),
      creatorId,
      isPublic,
    );
  }

  async setPassword(roomId: number, newPassword: string | null) {
    const passwordHash = newPassword ? await password.hash(newPassword) : null;
    const room = await prisma.room.update({
      where: { id: roomId },
      data: { passwordHash, isPublic: !passwordHash },
    });
    if (passwordHash) {
      // a new password locks out everyone who joined with the old one
      await prisma.roomMembership.updateMany({
        where: {
          roomId,
          revokedAt: null,
          actorId: room.creatorId ? { not: room.creatorId } : undefined,
        },
        data: { revokedAt: time.now() },
      });
    }
    return room;
  }

  async setDisplayName(roomId: number, newDisplayName: string) {
    return await prisma.room.update({
      where: { id: roomId },
      data: {
        displayName: newDisplayName,
      },
    });
  }

  /**
   * Gives a room a custom display name and a matching vanity route,
   * e.g. "Team Standup" at /team-standup. The room's previous custom
   * name is released.
   */
  async setCustomName(roomId: number, name: string) {
    const displayName = names_and_routes
      .getNormalizedDisplayName(String(name))
      .slice(0, MAX_ROOM_DISPLAY_NAME_LENGTH);
    const check = await this.checkVanityRoute(displayName, roomId);
    if (!check.available) {
      throw roomNameError(
        check.reason === 'taken'
          ? `The name "${check.route}" is already taken`
          : check.reason === 'reserved'
          ? `The name "${check.route}" is reserved`
          : `Room names need ${MIN_VANITY_ROUTE_LENGTH}-${MAX_VANITY_ROUTE_LENGTH} letters or numbers`,
        check.reason === 'taken'
          ? _error.code.ROOM_NAME_TAKEN
          : _error.code.INVALID_API_PARAMS,
      );
    }
    try {
      const [, , room] = await prisma.$transaction([
        prisma.roomRoute.deleteMany({ where: { roomId, isVanity: true } }),
        prisma.roomRoute.create({
          data: { roomId, route: check.route, isVanity: true },
        }),
        prisma.room.update({
          where: { id: roomId },
          data: { displayName, updatedAt: time.now() },
        }),
      ]);
      return { room, vanityRoute: check.route };
    } catch (err: any) {
      // another request claimed the name between the check and the write
      if (err.code === 'P2002') {
        throw roomNameError(
          `The name "${check.route}" is already taken`,
          _error.code.ROOM_NAME_TAKEN,
        );
      }
      throw err;
    }
  }

  async deleteRoom(roomId: number) {
    await prisma.$transaction([
      // frees the room's custom name for other rooms
      prisma.roomRoute.deleteMany({ where: { roomId, isVanity: true } }),
      prisma.room.update({
        where: { id: roomId },
        data: { deletedAt: time.now() },
      }),
    ]);
  }

  async restoreRoom(roomId: number) {
    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: null },
    });
  }
}

export default new Core();
