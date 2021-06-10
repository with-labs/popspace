const getName = async (params) => {
  let route = params.route
  if(!route) {
    route = await shared.db.rooms.generateUniqueRoomId()
  }
  return route
}

shared.test.factory.define("room_route", "room_routes", (params) => {

  return {
    room_id: params.room_id || shared.test.factory.assoc('room', 'id'),
    route: getRoute(params),
    priority_level: params.priority_level || 3,
    is_vanity: params.is_vanity || true
  }
})
