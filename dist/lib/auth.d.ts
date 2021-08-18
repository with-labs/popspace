import { Session } from '@prisma/client';
export declare class Auth {
    actorFromToken(token: string): Promise<import(".prisma/client").Actor>;
    actorAndSessionFromToken(token: string): Promise<{
        actor?: undefined;
        session?: undefined;
    } | {
        actor: import(".prisma/client").Actor;
        session: Session;
    }>;
    tokenFromSession(session: Session): string;
    sessionFromToken(sessionToken: string): Promise<Session>;
    isExpired(entity: {
        expiresAt?: string | Date;
    }): boolean;
    needsNewSessionToken(sessionToken: string, actor: any): Promise<boolean>;
}
declare const _default: Auth;
export default _default;
