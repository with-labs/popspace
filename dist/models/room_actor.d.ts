/**
 * FIXME: confusing, maybe broken typings
  A RoomActor is an actor connected to a room
*/
declare class RoomActor {
    actor: any;
    room: any;
    constructor(room: any, actor: any);
    get roomId(): any;
    get actorId(): any;
    serialize(): Promise<{
        actor: any;
        room: any;
    }>;
}
export default RoomActor;
