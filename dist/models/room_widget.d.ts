import { Actor, Widget, WidgetState, WidgetTransform } from '@prisma/client';
declare class RoomWidget {
    static fromWidgetId: (widgetId: bigint, roomId: bigint) => Promise<RoomWidget>;
    static allInRoom: (roomId: bigint) => Promise<any[]>;
    _creator: Actor;
    _creatorDisplayName: string;
    _pgWidget: Widget;
    _roomId: bigint;
    _roomWidgetState: WidgetTransform;
    _widgetState: WidgetState;
    constructor(roomId: bigint, pgWidget: Widget, widgetState: WidgetState, roomWidgetState: WidgetTransform, creatorDisplayName: string);
    widgetId(): bigint;
    widgetState(): string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
    roomWidgetState(): import(".prisma/client").Prisma.JsonValue;
    roomId(): bigint;
    creatorId(): bigint;
    setCreator(creator: Actor): void;
    creator(): Promise<any>;
    creatorDisplayName(): Promise<any>;
    serialize(): Promise<{
        widget_id: bigint;
        creator_id: bigint;
        type: string;
        widget_state: string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
        creator_display_name: any;
        transform: import(".prisma/client").Prisma.JsonValue;
    } | {
        messages: {
            hasMoreToLoad: boolean;
            messageList: ({
                sender: {
                    id: bigint;
                    displayName: string;
                };
                id: bigint;
                createdAt: Date;
                chatId: bigint;
                content: string;
            } & {
                senderDisplayName: string;
            })[];
        };
        widget_id: bigint;
        creator_id: bigint;
        type: string;
        widget_state: string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
        creator_display_name: any;
        transform: import(".prisma/client").Prisma.JsonValue;
    }>;
}
export default RoomWidget;
