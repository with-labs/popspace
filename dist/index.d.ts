/// <reference types="qs" />
/// <reference types="express" />
declare const shared: {
    db: {
        config: {
            driver: string;
            user: string;
            password: string;
            host: string;
            database: string;
            port: string;
        };
        pg: import("./db/pg").Pg;
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
        time: import("./db/time").Time;
        accounts: import("./db/accounts").Accounts;
        events: import("./db/events").Events;
        room: {
            memberships: import("./db/room/memberships").Memberships;
            permissions: import("./db/room/permissions").Permissions;
            namesAndRoutes: import("./db/room/names_and_routes").NamesAndRoutes;
            data: import("./db/room/data").Data;
            core: import("./db/room/core").Core;
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
        dynamo: import("./db/dynamo/dynamo").Dynamo;
        redis: {
            RedisBase: typeof import("./db/redis/redis_base").default;
        };
        magic: import("./db/magic").Magic;
        experienceRatings: import("./db/experience_ratings").ExperienceRatings;
        wallpapers: import("./db/wallpapers").Wallpapers;
        messages: import("./db/messages/messages").Messages;
        serialization: {
            replacer: (key: string, value: any) => any;
            serialize: (value: any) => string;
            reviver: (key: string, value: any) => any;
            deserialize: (value: string) => any;
            formatBigInt: (value: bigint | BigInt) => string;
            detectBigInt: (value: any) => boolean;
            parseBigInt: (value: string | number) => bigint;
        };
        constants: typeof import("./db/constants");
    };
    lib: {
        auth: import("./lib/auth").Auth;
        args: {
            consolidateEmailString: (email: string) => string;
            multiSpaceToSingleSpace: (str: string) => string;
            multiDashToSingleDash: (str: string) => string;
        };
        otp: {
            isExpired: (entity: import(".prisma/client").MagicCode) => boolean;
            verify: (entry: import(".prisma/client").MagicCode, code: string) => {
                error: any;
                result: any;
            } | {
                error: string;
            };
            checkEntryValidity: (entry: import(".prisma/client").MagicCode) => {
                error: string;
                result?: undefined;
            } | {
                error: any;
                result: any;
            };
            verifyUnresolvable: (entry: import(".prisma/client").MagicCode, code: string) => {
                error: any;
                result: any;
            } | {
                error: string;
            };
            checkEntryValidityUnresolvable: (entry: import(".prisma/client").MagicCode) => {
                error: string;
                result?: undefined;
            } | {
                error: any;
                result: any;
            };
            generate: () => string;
            standardExpiration: () => string;
            expirationInNDays: (n: number) => string;
        };
        routes: {
            dashboard: () => string;
            getVerifyUrl(magic: import(".prisma/client").MagicCode): string;
            getLoginUrl(magic: import(".prisma/client").MagicCode): string;
        };
    };
    error: {
        code: {
            UNEXPECTED_ERROR: string;
            INVALID_API_PARAMS: string;
            INVALID_CODE: string;
            EXPIRED_CODE: string;
            RESOLVED_CODE: string;
            REVOKED_CODE: string;
            MAGIC_CODE_INVALID_ACTION: string;
            JOIN_ALREADY_MEMBER: string;
            TOO_MANY_OWNED_ROOMS: string;
            ALREADY_INVITED: string;
            UNKNOWN_ROOM: string;
            INVALID_ROOM_CLAIM: string;
            UNAUTHORIZED_ROOM_ACCESS: string;
            ALREADY_CLAIMED: string;
            INCORRECT_ROOM_PASSCODE: string;
            INVALID_USER_IDENTITY: string;
            ALREADY_REGISTERED: string;
            UNAUTHORIZED_USER: string;
            PERMISSION_DENIED: string;
            ADMIN_ONLY_RESTRICTED: string;
            NO_SUCH_ACTOR: string;
            SESSION_REQUIRED: string;
            NOT_FOUND: string;
            RATE_LIMIT_EXCEEDED: string;
            OPENGRAPH_NO_DATA: string;
        };
        report: (error: Error, tag: string, actorId: bigint, httpCode: number, noodleCode: string) => import(".prisma/client").Prisma.Prisma__ErrorClient<import(".prisma/client").Error>;
    };
    models: {
        Actor: typeof import("./models/actor").default;
        Profile: typeof import("./models/profile").default;
        RoomActor: typeof import("./models/room_actor").default;
        RoomData: typeof import("./models/room_data").default;
        RoomMember: typeof import("./models/room_member").default;
        RoomWidget: typeof import("./models/room_widget").default;
        RoomWithState: typeof import("./models/room_with_state").default;
    };
    api: {
        middleware: {
            getActor: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
            getIp: (req: any, res: any, next: any) => Promise<void>;
            requireActor: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
            roomFromRoute: (req: any, res: any, next: any) => Promise<any>;
            requireRoom: (req: any, res: any, next: any) => Promise<any>;
            requireRoomCreator: (req: any, res: any, next: any) => Promise<any>;
            requireRoomMember: (req: any, res: any, next: any) => Promise<any>;
            requireRoomMemberOrCreator: (req: any, res: any, next: any) => Promise<any>;
            requireAdmin: (req: any, res: any, next: any) => Promise<any>;
        };
        http: {
            code: {
                OK: number;
                CREATED: number;
                ACCEPTED: number;
                BAD_REQUEST: number;
                UNAUTHORIZED: number;
                PAYMENT_REQUIRED: number;
                FORBIDDEN: number;
                NOT_FOUND: number;
                METHOD_NOT_ALLOWED: number;
                NOT_ACCEPTABLE: number;
                PROXY_AUTHENTICATION_REQUIRED: number;
                REQUEST_TIMEOUT: number;
                CONFLICT: number;
                GONE: number;
                LENGTH_REQUIRED: number;
                PRECONDITION_FAILED: number;
                PAYLOAD_TOO_LARGE: number;
                URI_TOO_LONG: number;
                UNSUPPORTED_MEDIA_TYPE: number;
                RANGE_NOT_SATISFIABLE: number;
                EXPECTATION_FAILED: number;
                IM_A_TEAPOT: number;
                MISDIRECTED_REQUEST: number;
                UNPROCESSABLE_ENTITY: number;
                LOCKED: number;
                FAILED_DEPENDENCY: number;
                TOO_EARLY: number;
                UPGRADE_REQUIRED: number;
                PRECONDITION_REQUIRED: number;
                TOO_MANY_REQUESTS: number;
                REQUEST_HEADER_FIELDS_TOO_LARGE: number;
                UNAVAILABLE_FOR_LEGAL_REASONS: number;
                INTERNAL_SERVER_ERROR: number;
            };
        };
    };
    net: {
        HttpClient: any;
    };
    init: () => Promise<void>;
    cleanup: () => Promise<void>;
    requireTesting: () => any;
    initDynamo: () => Promise<void>;
};
export default shared;
