// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisma'.
const prisma = require('./prisma');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SYSTEM_USE... Remove this comment to see the full error message
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
