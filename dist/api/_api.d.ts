/// <reference types="qs" />
/// <reference types="express" />
declare const _default: {
    middleware: {
        getActor: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        getIp: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        requireActor: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        roomFromRoute: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: any) => Promise<any>;
        requireRoom: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: any) => Promise<any>;
        requireRoomCreator: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        requireRoomMember: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        requireRoomMemberOrCreator: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
        requireAdmin: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>;
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
export default _default;
