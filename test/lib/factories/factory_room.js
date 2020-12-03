factory.define("room", "rooms", (params) => {
  return {
    id: factory.sequence('room.id', (n) => n),
    owner_id: params.owner_id || factory.assoc('user', 'id'),
  }
})
