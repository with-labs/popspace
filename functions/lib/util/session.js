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

const sessionTools = {
  createSessionId: (userId) => {
    return crypto.randomBytes(64).toString('base64');
  },

  beginSession: async (userId, sessionStore) => {
    const sessionId = sessionTools.createSessionId(userId);

    const redisKey = sessionKey(userId);
    const hKey = sessionId;
    const sessionInfo = {
      expireAtTimestamp: null,
      createdAt: Date.now()
      // We don't need to store the userId/sessionId,
      // Since we have them as keys
    }
    await sessionStore.hset(redisKey, hKey, JSON.stringify(sessionInfo));

    const token = {sessionId: sessionId, userId: userId};
    return token;
  },

  verifySessionToken: async (token, sessionStore) => {
    const userId = token.userId;
    const sessionId = token.sessionId;
    const redisKey = sessionKey(userId);
    const hKey = sessionId;
    const sessionInfo = await sessionStore.hget(redisKey, hKey);
    return isValid(sessionInfo);
  }
};

module.exports = sessionTools;
