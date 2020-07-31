const crypto = require("crypto")

const session = {
  createSessionId: (userId) => {
    return crypto.randomBytes(64).toString('base64');
  },

  beginSession: async (userId, sessionStore) => {
    const sessionId = session.createSessionId(userId);
    await sessionStore.storeSession(sessionId, userId);
    const token = {sessionId: sessionId, userId: userId};
    return token;
  }
};

module.exports = session;
