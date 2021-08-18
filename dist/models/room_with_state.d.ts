import { Room } from '@prisma/client';
declare class RoomWithState {
    static allVisitableForActorId: (actorId: bigint) => Promise<{
        created: RoomWithState[];
        member: RoomWithState[];
    }>;
    static fromRoomId: (roomId: bigint) => Promise<RoomWithState>;
    static fromRooms: (rooms: Room[]) => Promise<any[]>;
    _pgRoom: Room;
    _roomState: any;
    constructor(pgRoom: Room, roomState: any);
    roomId(): bigint;
    urlId(): string;
    creatorId(): bigint;
    displayName(): string;
    route(): string;
    roomState(): any;
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
