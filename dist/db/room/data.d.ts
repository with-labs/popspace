export declare class Data {
    /************************************************/
    /****************** ROOM      *******************/
    /************************************************/
    setRoomState(roomId: bigint, newState: any): import(".prisma/client").Prisma.Prisma__RoomStateClient<import(".prisma/client").RoomState>;
    updateRoomState(roomId: bigint, stateUpdate: any, curState?: any): Promise<import(".prisma/client").RoomState>;
    getRoomState(roomId: bigint): Promise<import(".prisma/client").RoomState>;
    getRoomWallpaperData(roomId: bigint): Promise<import(".prisma/client").Wallpaper>;
    /************************************************/
    /****************** PARTICIPANTS   **************/
    /************************************************/
    getParticipantState(actorId: bigint): Promise<import(".prisma/client").Prisma.JsonValue>;
    updateParticipantState(actorId: bigint, participantState: any, curState?: any): Promise<import(".prisma/client").Prisma.JsonValue>;
    setParticipantState(actorId: bigint, newState: any): Promise<import(".prisma/client").Prisma.JsonValue>;
    getRoomParticipantState(roomId: bigint, actorId: bigint): Promise<import(".prisma/client").Prisma.JsonValue>;
    updateRoomParticipantState(roomId: bigint, actorId: bigint, stateUpdate: any, curState?: any): Promise<import(".prisma/client").Prisma.JsonValue>;
    setRoomParticipantState(roomId: bigint, actorId: bigint, newState: any): Promise<import(".prisma/client").Prisma.JsonValue>;
    /************************************************/
    /****************** WIDGETS   *******************/
    /************************************************/
    addWidgetInRoom(creatorId: bigint, roomId: bigint, type: string, desiredWidgetState: any, desiredRoomWidgetState: any, creator?: any): Promise<import("../../models/room_widget").default>;
    softDeleteWidget(widgetId: bigint, deletingActorId?: bigint | null): import(".prisma/client").Prisma.Prisma__WidgetClient<import(".prisma/client").Widget>;
    eraseWidget(widgetId: bigint): Promise<[import(".prisma/client").Widget, import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").WidgetState, import(".prisma/client").Prisma.BatchPayload]>;
    getRoomWidgetState(roomId: bigint, widgetId: bigint): Promise<import(".prisma/client").Prisma.JsonValue>;
    updateRoomWidgetState(roomId: bigint, widgetId: bigint, stateUpdate: any, roomWidgetState?: any): Promise<import(".prisma/client").WidgetTransform>;
    setRoomWidgetState(roomId: bigint, widgetId: bigint, newState: any): import(".prisma/client").Prisma.Prisma__WidgetTransformClient<import(".prisma/client").WidgetTransform>;
    getWidgetState(widgetId: bigint): Promise<import(".prisma/client").Prisma.JsonValue>;
    updateWidgetState(widgetId: bigint, stateUpdate: any, widgetState?: any): Promise<import(".prisma/client").WidgetState>;
    setWidgetState(widgetId: bigint, newState: any): import(".prisma/client").Prisma.Prisma__WidgetStateClient<import(".prisma/client").WidgetState>;
}
declare const _default: Data;
export default _default;
