shared.test.factory.define("room", "rooms", (params) => {
  return {
    id: shared.test.factory.sequence('rooms.id', (n) => n),
    owner_id: params.owner_id || shared.test.factory.assoc('user', 'id'),
    is_public: true
  }
})
