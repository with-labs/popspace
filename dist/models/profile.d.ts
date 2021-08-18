import { Actor } from '@prisma/client';
export default class Profile {
    actor: Actor;
    constructor(actor: Actor);
    serialize(): Promise<{
        actor: Actor;
        participantState: import(".prisma/client").Prisma.JsonValue;
        rooms: {
            owned: Promise<{
                roomId: bigint;
                creatorId: bigint;
                previewImageUrl: string;
                displayName: string;
                route: string;
                urlId: string;
            }[]>;
            member: Promise<{
                roomId: bigint;
                creatorId: bigint;
                previewImageUrl: string;
                displayName: string;
                route: string;
                urlId: string;
            }[]>;
        };
    }>;
}
