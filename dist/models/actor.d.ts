import { Actor as DbActor } from '@prisma/client';
declare class Actor {
    static fromActorId: (actorId: bigint) => Promise<Actor>;
    _pgActor: DbActor;
    constructor(pgActor: DbActor);
    actorId(): bigint;
    displayName(): string;
    kind(): string;
    serialize(): Promise<{
        actorId: bigint;
        displayName: string;
        kind: string;
    }>;
}
export default Actor;
