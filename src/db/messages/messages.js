const prisma = require('../prisma');

const MESSAGE_LIMIT = 30;

class Messages {
  constructor() {}

  async getWholeChat(chatId) {
    const results = await prisma.message.findMany({
      where: {
        chatId,
      },
      select: {
        sender: {
          id: true,
          displayName: true,
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
    return results.map((result) => {
      result.senderDisplayName = result.sender.displayName;
      return result;
    });
  }

  async getNextPageMessages(chatId, lastChatMessageId) {
    const filter = { chatId };
    // for pages starting at a cursor, get ids less than the cursor id
    if (lastChatMessageId) {
      filter.id = { $lt: lastChatMessageId };
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
          id: true,
          displayName: true,
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
        message.senderDisplayName = message.sender.displayName;
        return message;
      }),
    };
  }
}

module.exports = new Messages();
