import prisma from '../prisma';

const MESSAGE_LIMIT = 30;

export class Messages {
  constructor() {}

  async getWholeChat(chatId: number) {
    const results = await prisma.message.findMany({
      where: {
        chatId,
      },
      select: {
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
        id: true,
        senderId: true,
        chatId: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    // TODO: transition to using sender object on messages instead of denormalizing senderDisplayName onto main object
    return results.map((message) => {
      (message as typeof message & {
        senderDisplayName: string;
      }).senderDisplayName = message.sender.displayName;
      return message as typeof message & { senderDisplayName: string };
    });
  }

  async getNextPageMessages(chatId: number, lastChatMessageId: number) {
    const filter = { chatId };
    // for pages starting at a cursor, get ids less than the cursor id
    if (lastChatMessageId) {
      (filter as any).id = { $lt: lastChatMessageId };
    }
    const messages = await prisma.message.findMany({
      where: filter,
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        chatId: true,
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      take: MESSAGE_LIMIT,
    });

    // id the query returns no messages, or if it returns less than the MESSAGE_LIMIT
    // there are no messages left to get, so set hasMoreToLoad to false
    return {
      hasMoreToLoad: !(
        messages.length < MESSAGE_LIMIT || messages.length === 0
      ),
      // reverse the order of the messages so that the most recent messages are first
      messageList: messages.reverse().map((message) => {
        // TODO: transition to using sender object on messages instead of denormalizing senderDisplayName onto main object
        (message as typeof message & {
          senderDisplayName: string;
        }).senderDisplayName = message.sender.displayName;
        return message as typeof message & { senderDisplayName: string };
      }),
    };
  }
}

export default new Messages();
