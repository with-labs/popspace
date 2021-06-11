shared.test.factory.define("session", "sessions", (params) => {
  return {
    id: shared.test.factory.sequence('sessions.id', (n) => n),
    secret: shared.test.chance.hash({length: 32}),
    actor_id: params.actor_id || shared.test.factory.assoc('actor', 'id'),
    expires_at: params.expires_at || null,
    revoked_at: params.revoked_at || null
  };
});
