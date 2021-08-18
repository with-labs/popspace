declare const _default: {
    memberships: import("./memberships").Memberships;
    permissions: import("./permissions").Permissions;
    namesAndRoutes: import("./names_and_routes").NamesAndRoutes;
    data: import("./data").Data;
    core: import("./core").Core;
    templates: {
        setUpRoomFromTemplate: (roomId: bigint, templateData: any) => Promise<{
            state: any;
            widgets: any[];
            id: bigint;
        }>;
        empty: (displayName?: string) => {
            displayName: string;
            state: {};
            widgets: any[];
        };
        createTemplate: (templateName: string, data: any, creatorId?: bigint) => import(".prisma/client").Prisma.Prisma__RoomTemplateClient<import(".prisma/client").RoomTemplate>;
    };
};
export default _default;
