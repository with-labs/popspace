factory.define("session", "sessions", (params) => {
  return {
    id: factory.sequence('session.id', (n) => n),
    secret: chance.hash({length: 32}),
    user_id: params.user_id || factory.assoc('user', 'id'),
    expires_at: params.expires_at || null
  };
});
