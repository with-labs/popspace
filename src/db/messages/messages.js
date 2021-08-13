const MESSAGE_LIMIT = 30;

class Messages {
  constructor() {
  }

  async getWholeChat(chatId) {
    // get the whole chat log
    return await shared.db.pg.massive.query(`
      SELECT
        messages.id as id,
        chat_id,
        content,
        sender_id,
        actors.display_name as sender_display_name,
        messages.created_at as created_at
      FROM 
        messages
        JOIN actors ON messages.sender_id = actors.id
      WHERE chat_id = $1
      ORDER BY messages.created_at
      ASC
  `,[chatId])
  }

  async getNextPageMessages(chatId, lastChatMessageId) {
    const messages = await shared.db.pg.massive.query(`
      SELECT *
      FROM 
        (
        SELECT
            messages.id,
            chat_id,
            content,
            sender_id,
            actors.display_name as sender_display_name,
            messages.created_at as created_at
          FROM 
            messages
            JOIN actors ON messages.sender_id = actors.id
        WHERE messages.chat_id = $1 AND messages.id < COALESCE($2, 9223372036854775807)
        ORDER BY messages.ID 
        DESC 
        LIMIT $3
      ) as prev_messages
      ORDER BY prev_messages.created_at
      ASC;
    `, [chatId, lastChatMessageId, MESSAGE_LIMIT])

    // id the query returns no messages, or if it returns less than the MESSAGE_LIMIT
    // there are no messages left to get, so set hasMoreToLoad to false
    return {
      hasMoreToLoad: !(messages.length < MESSAGE_LIMIT || messages.length === 0),
      messageList: messages
    }
  }
}

module.exports = new Messages()
