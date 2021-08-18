declare const _default: {
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
/**
 * @typedef {Object} RoomState
 * @property {string} wallpaperUrl
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} TemplateData
 * @property {RoomState} state
 * @property {string} displayName
 * @property {Array} widgets - A tuple of [WidgetType, WidgetState, Transform]
 */
export default _default;
