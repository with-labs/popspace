declare module '@withso/noodle-shared' {
  import { PrismaClient } from '@prisma/client';
  // until and if we migrate to direct imports, this will do...
  // only defining the stuff I care about atm.
  export interface SharedLib {
    db: {
      prisma: PrismaClient;
    };
  }
  const shared: SharedLib;
  export default shared;
}

declare var shared: import('@withso/noodle-shared').SharedLib;
