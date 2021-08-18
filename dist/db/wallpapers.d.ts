export declare class Wallpapers {
    getWallpapersForActor(actorId: bigint): import(".prisma/client").PrismaPromise<import(".prisma/client").Wallpaper[]>;
    canUserAccessWallpaper(actorId: bigint, wallpaperId: bigint): Promise<boolean>;
}
declare const _default: Wallpapers;
export default _default;
