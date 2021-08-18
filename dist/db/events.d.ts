import { Request } from 'express';
declare module 'express' {
    interface Request {
        socket: any;
    }
}
export declare class Events {
    actorCreateEvent: (actorId: bigint, sessionId: bigint, source: string, expressRequest: Request) => import(".prisma/client").Prisma.Prisma__ActorEventClient<import(".prisma/client").ActorEvent>;
    roomCreateEvent: (actorId: bigint, sessionId: bigint, templateName: string, expressRequest: Request) => import(".prisma/client").Prisma.Prisma__ActorEventClient<import(".prisma/client").ActorEvent>;
    recordEvent: (actorId: bigint, sessionId: bigint, key: string, value: string | null, expressRequest?: Request, meta?: any) => import(".prisma/client").Prisma.Prisma__ActorEventClient<import(".prisma/client").ActorEvent>;
    eventFromRequest(actorId: bigint, sessionId: bigint, key: string, value: string | null, expressRequest?: Request, meta?: any): {
        actorId: bigint;
        sessionId: bigint;
        key: string;
        value: string;
        meta: any;
        ip: any;
        browser: any;
        device: any;
        vendor: any;
        engine: any;
        os: any;
        osVersion: any;
        engineVersion: any;
        browserVersion: any;
        reqUrl: string;
        userAgent: string;
    };
}
declare const _default: Events;
export default _default;
