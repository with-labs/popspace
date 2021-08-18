import { Prisma, Room, RoomState } from '@prisma/client';
declare class RoomWithState {
    static allVisitableForActorId: (actorId: bigint) => Promise<{
        created: RoomWithState[];
        member: RoomWithState[];
    }>;
    static fromRoomId: (roomId: bigint) => Promise<RoomWithState>;
    static fromRooms: (rooms: Room[]) => Promise<any[]>;
    _pgRoom: Room;
    _roomState: RoomState;
    constructor(pgRoom: Room, roomState: RoomState);
    roomId(): bigint;
    urlId(): string;
    creatorId(): bigint;
    displayName(): string;
    route(): string;
    roomState(): Prisma.JsonObject;
    previewImageUrl(): string;
    serialize(): Promise<{
        roomId: bigint;
        creatorId: bigint;
        previewImageUrl: string;
        displayName: string;
        route: string;
        urlId: string;
    }>;
}
export default RoomWithState;
