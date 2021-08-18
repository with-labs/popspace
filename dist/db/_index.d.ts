import * as constants from './constants';
declare const _default: {
    config: {
        driver: string;
        user: string;
        password: string;
        host: string;
        database: string;
        port: string;
    };
    pg: import("./pg").Pg;
    prisma: import(".prisma/client").PrismaClient<{
        __internal: {
            useUds: boolean;
        };
        datasources: {
            db: {
                url: string;
            };
        };
    }, never, false>;
    time: import("./time").Time;
    accounts: import("./accounts").Accounts;
    events: import("./events").Events;
    room: {
        memberships: import("./room/memberships").Memberships;
        permissions: import("./room/permissions").Permissions;
        namesAndRoutes: import("./room/names_and_routes").NamesAndRoutes;
        data: import("./room/data").Data;
        core: import("./room/core").Core;
        templates: {
            setUpRoomFromTemplate: (roomId: bigint, templateData: any) => Promise<{
                state: any;
                widgets: any[];
                id: bigint;
            }>;
            empty: (displayName?: string) => {
                displayName: string;
                state: {};
                widgets: any[];
            };
            createTemplate: (templateName: string, data: any, creatorId?: bigint) => import(".prisma/client").Prisma.Prisma__RoomTemplateClient<import(".prisma/client").RoomTemplate>;
        };
    };
    dynamo: import("./dynamo/dynamo").Dynamo;
    redis: {
        RedisBase: typeof import("./redis/redis_base").default;
    };
    magic: import("./magic").Magic;
    experienceRatings: import("./experience_ratings").ExperienceRatings;
    wallpapers: import("./wallpapers").Wallpapers;
    messages: import("./messages/messages").Messages;
    serialization: {
        replacer: (key: string, value: any) => any;
        serialize: (value: any) => string;
        reviver: (key: string, value: any) => any;
        deserialize: (value: string) => any;
        formatBigInt: (value: bigint | BigInt) => string;
        detectBigInt: (value: any) => boolean;
        parseBigInt: (value: string | number) => bigint;
    };
    constants: typeof constants;
};
export default _default;
