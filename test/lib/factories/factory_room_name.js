const getName = async (params) => {
  let name = params.name
  if(!name) {
    name = await shared.db.rooms.generateUniqueRoomId()
  }
  return name
}

factory.define("room_name", "room_names", (params) => {

  return {
    room_id: params.room_id || factory.assoc('room', 'id'),
    name: getName(params),
    priority_level: params.priority_level || 3,
    is_vanity: params.is_vanity || true
  }
})
