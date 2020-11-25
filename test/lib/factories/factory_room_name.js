factory.define("room_name", "room_names", (params) => {
  return {
    room_id: params.room_id || factory.assoc('room', 'id'),
    name: params.name || "test_room_name",
    priority_level: params.priority_level || 3,
    is_vanity: params.is_vanity || true
  }
})
