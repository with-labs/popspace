declare class RoomMember {
    static allInRoom: any;
    actor: any;
    participantState: any;
    room: any;
    constructor(room: any, actor: any, participantState: any);
    get roomId(): any;
    get actorId(): any;
    serialize(): Promise<{
        actor: any;
        room: any;
        participantState: any;
    }>;
}
export default RoomMember;
