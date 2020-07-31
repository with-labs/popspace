const crypto = require("crypto");

const sessionKey = (userId) => {
  return `with:sss:${userId}`;
}

const isValid = (session) => {
  if(session.expireAtTimestamp) {
    return session.expireAtTimestamp > Date.now();
  }
  return !!session;
}

const session = {
  createSessionId: (userId) => {
    return crypto.randomBytes(64).toString('base64');
  },

  beginSession: async (userId, sessionStore) => {
    const sessionId = session.createSessionId(userId);
    await sessionStore.storeSession(sessionId, userId);

    const session = {
      expireAtTimestamp: null,
      createdAt: Date.now()
      // We don't need to store the userId/sessionId,
      // Since we have them as keys
    }
    const redisKey = sessionKey(userId);
    const hKey = sessionId;
    await sessionStore.hset(redisKey, hKey, JSON.stringify(session));

    const token = {sessionId: sessionId, userId: userId};
    return token;
  },

  verifySessionToken: async (token, sessionStore) => {
    const userId = token.userId;
    const sessionId = token.sessionId;
    const redisKey = sessionKey(userId);
    const hKey = sessionId;
    const session = await sessionStore.hget(redisKey, hKey);
    return isValid(session);
  }
};

module.exports = session;
