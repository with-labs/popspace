import { Request } from 'express';
export declare class Accounts {
    constructor();
    delete(actorId: bigint): Promise<import(".prisma/client").Actor>;
    hardDelete(actorId: bigint): Promise<void>;
    actorById(id: bigint): Promise<import(".prisma/client").Actor>;
    createActor(kind: string, source: string, expressRequest: Request): import(".prisma/client").Prisma.Prisma__ActorClient<import(".prisma/client").Actor>;
    createLoginRequest(actor: any): Promise<import(".prisma/client").MagicCode>;
    createSession(actorId: bigint, tx?: any, req?: Request | null): Promise<import(".prisma/client").Session>;
    newsletterSubscribe(actorId: bigint): Promise<void>;
    newsletterUnsubscribe(actorId: bigint): Promise<void>;
}
declare const _default: Accounts;
export default _default;
