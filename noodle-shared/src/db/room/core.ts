import prisma from '../prisma';
import time from '../time';
import names_and_routes from './names_and_routes';
import templates from './templates';

export class Core {
  constructor() {}

  /********************* GETTERS *******************/
  async roomById(id: bigint) {
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
    const urlId = names_and_routes.urlIdFromRoute(route);
    return await this.roomByUrlId(urlId);
  }

  async routableRoomById(id: bigint) {
    /*
      TODO: At this point, this should return a model,
      or be deleted altogether - perhaps a model constructor
      would work better
    */
    return this.roomById(id);
  }

  getCreatedRoutableRooms(actorId: bigint) {
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

  async getMemberRoutableRooms(actorId: bigint) {
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
    creatorId: bigint,
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
      templateData = templateRow.data;
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
    creatorId: bigint,
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
    creatorId: bigint,
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

  async setDisplayName(roomId: bigint, newDisplayName: string) {
    return await prisma.room.update({
      where: { id: roomId },
      data: {
        displayName: newDisplayName,
      },
    });
  }

  async deleteRoom(roomId: bigint) {
    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: time.now() },
    });
  }

  async restoreRoom(roomId: bigint) {
    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: null },
    });
  }
}

export default new Core();
