shared.test.factory.define("room", "rooms", (params) => {
  return {
    id: shared.test.factory.sequence('rooms.id', (n) => n),
    creator_id: params.creator_id || shared.test.factory.assoc('actor', 'id'),
    is_public: true
  }
})
