import { SYSTEM_USER_ID } from './constants';
import prisma from './prisma';

export class Wallpapers {
  getWallpapersForActor(actorId: bigint) {
    return prisma.wallpaper.findMany({
      where: {
        creatorId: {
          in: [actorId, SYSTEM_USER_ID],
        },
      },
    });
  }

  async canUserAccessWallpaper(actorId: bigint, wallpaperId: bigint) {
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

export default new Wallpapers();
