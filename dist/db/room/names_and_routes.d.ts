export declare class NamesAndRoutes {
    constructor();
    roomToRoute(room: any): string;
    route(displayName: string, urlRoomId: string): string;
    urlIdFromRoute(route: string): string;
    generateUniqueRoomUrlId(): Promise<string>;
    getNormalizedDisplayName(displayName: string): string;
    getUrlName(displayName: string): string;
    generateRoomId(): string;
    roomIdFromSchema(schema: string): string;
    isUniqueIdString(idString: string): Promise<boolean>;
}
declare const _default: NamesAndRoutes;
export default _default;
