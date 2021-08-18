import { Room } from '@prisma/client';
declare class RoomData {
    room: Room;
    constructor(room: Room);
    get roomId(): bigint;
    get urlId(): string;
    get route(): string;
    get displayName(): string;
    widgets(): Promise<any[]>;
    state(): Promise<import(".prisma/client").Prisma.JsonValue>;
    wallpaper(): Promise<import(".prisma/client").Wallpaper>;
    serialize(): Promise<{
        id: bigint;
        displayName: string;
        route: string;
        urlId: string;
        widgets: any[];
        state: string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
        wallpaper: import(".prisma/client").Wallpaper;
    }>;
}
export default RoomData;
