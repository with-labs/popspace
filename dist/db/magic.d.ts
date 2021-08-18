import { MagicCode } from '@prisma/client';
/**
Manages life cycle of magic links.

Magic links permit executing various restricted access for
a given actor: e.g. unsubscribing from a mailing list.
*/
export declare class Magic {
    static actions: {
        UNSUBSCRIBE: string;
        SUBSCRIBE: string;
    };
    constructor();
    unsubscribeUrl(appUrl: string, magicLink: {
        code: string;
    }): Promise<string>;
    createUnsubscribe(actorId: bigint): Promise<MagicCode>;
    createSubscribe(actorId: bigint): Promise<MagicCode>;
    magicLinkByCode(code: string): import(".prisma/client").Prisma.Prisma__MagicCodeClient<MagicCode>;
    tryToResolveMagicLink(request: MagicCode, expectedAction: string): Promise<{
        error?: undefined;
    } | {
        error: string;
    }>;
    tryToUnsubscribe(request: MagicCode): Promise<{
        error?: undefined;
    } | {
        error: string;
    }>;
    tryToSubscribe(request: MagicCode): Promise<{
        error?: undefined;
    } | {
        error: string;
    }>;
    unsubscribe(request: MagicCode): Promise<{
        error: string;
    } | {
        error?: undefined;
    }>;
    subscribe(request: MagicCode): Promise<{
        error: string;
    } | {
        error?: undefined;
    }>;
    requireActor(request: MagicCode): Promise<{
        error: string;
    } | {
        error?: undefined;
    }>;
}
declare const _default: Magic;
export default _default;
