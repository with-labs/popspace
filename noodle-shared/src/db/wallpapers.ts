import { SYSTEM_USER_ID } from './constants';
import prisma from './prisma';

export class Wallpapers {
  getWallpapersForActor(actorId: number) {
    return prisma.wallpaper.findMany({
      where: {
        creatorId: {
          in: [actorId, SYSTEM_USER_ID],
        },
      },
    });
  }

  async canUserAccessWallpaper(actorId: number, wallpaperId: number) {
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
