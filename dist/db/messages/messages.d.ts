export declare class Messages {
    constructor();
    getWholeChat(chatId: bigint): Promise<({
        sender: {
            id: bigint;
            displayName: string;
        };
        id: bigint;
        createdAt: Date;
        chatId: bigint;
        content: string;
        senderId: bigint;
    } & {
        senderDisplayName: string;
    })[]>;
    getNextPageMessages(chatId: bigint, lastChatMessageId: bigint): Promise<{
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
    }>;
}
declare const _default: Messages;
export default _default;
