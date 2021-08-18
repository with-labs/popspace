export declare class Core {
    constructor();
    /********************* GETTERS *******************/
    roomById(id: bigint): Promise<import(".prisma/client").Room>;
    roomByUrlId(urlId: string): Promise<import(".prisma/client").Room>;
    roomByRoute(route: string): Promise<import(".prisma/client").Room>;
    routableRoomById(id: bigint): Promise<import(".prisma/client").Room>;
    getCreatedRoutableRooms(actorId: bigint): import(".prisma/client").PrismaPromise<{
        id: bigint;
        displayName: string;
        creatorId: bigint;
        urlId: string;
    }[]>;
    getMemberRoutableRooms(actorId: bigint): Promise<{
        roomId: bigint;
        memberAsOf: Date;
        displayName: string;
        creatorId: bigint;
    }[]>;
    /*********************************** MODIFIERS ****************************/
    /**
     * Create a room using provided template data.
     * @param {TemplateData} template
     * @param {number} creatorId - may be deprecated as we move to anon actors
     */
    createRoomFromTemplate(templateName: string, template: any, creatorId: bigint, isPublic?: boolean): Promise<{
        room: import(".prisma/client").Room;
        roomData: {
            state: any;
            widgets: any[];
            id: bigint;
        };
    }>;
    createRoom(creatorId: bigint, displayName: string, templateName: string, isPublic?: boolean): Promise<import(".prisma/client").Room>;
    createEmptyRoom(creatorId: bigint, isPublic: boolean, displayName: string): Promise<{
        room: import(".prisma/client").Room;
        roomData: {
            state: any;
            widgets: any[];
            id: bigint;
        };
    }>;
    setDisplayName(roomId: bigint, newDisplayName: string): Promise<import(".prisma/client").Room>;
    deleteRoom(roomId: bigint): Promise<void>;
    restoreRoom(roomId: bigint): Promise<void>;
}
declare const _default: Core;
export default _default;
