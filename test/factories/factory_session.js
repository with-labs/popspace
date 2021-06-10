shared.test.factory.define("session", "sessions", (params) => {
  return {
    id: shared.test.factory.sequence('sessions.id', (n) => n),
    secret: shared.test.chance.hash({length: 32}),
    user_id: params.user_id || shared.test.factory.assoc('user', 'id'),
    expires_at: params.expires_at || null
  };
});
