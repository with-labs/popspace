const prisma = require('./prisma');
const { SYSTEM_USER_ID } = require('./constants');

class Wallpapers {
  getWallpapersForActor(actorId) {
    return prisma.wallpaper.findMany({
      where: {
        creatorId: {
          in: [actorId, SYSTEM_USER_ID],
        },
      },
    });
  }

  async canUserAccessWallpaper(actorId, wallpaperId) {
    return !!(await prisma.wallpaper.findFirst({
      where: {
        id: wallpaperId,
        creatorId: {
          in: [actorId, SYSTEM_USER_ID],
        },
      },
    }));
  }
}

module.exports = new Wallpapers();
