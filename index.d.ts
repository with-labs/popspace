declare module '@withso/noodle-shared' {
  // until and if we migrate to direct imports, this will do...
  // only defining the stuff I care about atm.
  interface SharedLib {
    db: {
      prisma: import('@prisma/client').PrismaClient;
    };
  }
  const shared: SharedLib;
  export default shared;
}
