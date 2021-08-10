const prisma = require('../prisma');

class Core {
  constructor() {}

  /********************* GETTERS *******************/
  async roomById(id) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (room.deletedAt) return null;
    return room;
  }

  async roomByUrlId(urlId) {
    const room = await prisma.room.findUnique({ where: { urlId } });
    if (room.deletedAt) return null;
    return room;
  }

  async roomByRoute(route) {
    const urlId = shared.db.room.namesAndRoutes.urlIdFromRoute(route);
    return await this.roomByUrlId(urlId);
  }

  async routableRoomById(id) {
    /*
      TODO: At this point, this should return a model,
      or be deleted altogether - perhaps a model constructor
      would work better
    */
    return this.roomById(id);
  }

  getCreatedRoutableRooms(actorId) {
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

  async getMemberRoutableRooms(actorId) {
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
          displayName: true,
          creatorId: true,
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
    templateName,
    template,
    creatorId,
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
    const roomData = await shared.db.room.templates.setUpRoomFromTemplate(
      room.id,
      templateData,
    );
    return { room, roomData };
  }

  async createRoom(creatorId, displayName, templateName, isPublic = true) {
    const urlId = await shared.db.room.namesAndRoutes.generateUniqueRoomUrlId();
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

  async createEmptyRoom(creatorId, isPublic, displayName) {
    return this.createRoomFromTemplate(
      'empty',
      shared.db.room.templates.empty(),
      creatorId,
      isPublic,
    );
  }

  async setDisplayName(roomId, newDisplayName) {
    return await prisma.room.update({
      where: { id: roomId },
      data: {
        displayName: newDisplayName,
      },
    });
  }

  async deleteRoom(roomId) {
    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: shared.db.time.now() },
    });
  }

  async restoreRoom(roomId) {
    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: null },
    });
  }
}

module.exports = new Core();
