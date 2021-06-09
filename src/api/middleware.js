const base64Decode = (str) => Buffer.from(str, "base64").toString("utf-8")

const middleware = {
  getUser: async (req, res, next) => {
    // support Authorization header with a bearer token,
    // fallback to a `token` field on a POST body
    const authHeader = req.headers.authorization || req.headers.Authorization
    const token = authHeader && authHeader.startsWith("Bearer")
        ? base64Decode(authHeader.replace("Bearer ", ""))
        : null
    if (!token) {
      return next()
    }
    const session = await shared.db.accounts.sessionFromToken(token)
    if (!session) {
      return next()
    }
    const userId = parseInt(session.user_id)
    const user = await shared.db.accounts.userById(userId)
    if (!user) {
      return next()
    }
    req.user = user
    req.session = session
    next()
  },

  getIp: async (req, res, next) => {
    /*
      https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    */
    req.ip = req.headers['x-forwarded-for'] || (req.connection ? req.connection.remoteAddress : null)
    next()
  },

  requireUser: async (req, res, next) => {
    if(!req.user) {
      return next({ errorCode: shared.error.code.LOG_IN_REQUIRED, message: "Must be logged in", httpCode: shared.api.http.code.UNAUTHORIZED })
    }
    next()
  },

  roomFromRoute: async (req, res, next) => {
    if(!req.body.room_route) {
      return next({ errorCode: shared.error.code.INVALID_API_PARAMS, message: "Must provide room_route" }, shared.api.http.code.BAD_REQUEST)
    }
    req.room = await shared.db.rooms.roomByRoute(req.body.room_route)
    next()
  },

  requireRoom: async (req, res, next) => {
    if(!req.room) {
      return next({ errorCode: shared.error.code.UNKNOWN_ROOM, message: "Unknown room" }, shared.api.http.code.BAD_REQUEST)
    }
    next()
  },

  requireRoomOwner: async (req, res, next) => {
    if(req.user.id != req.room.owner_id) {
      return next({ errorCode: shared.error.code.PERMISSION_DENIED, message: "Insufficient permission", httpCode: shared.api.http.code.UNAUTHORIZED })
    }
    next()
  },

  requireRoomMemberOrOwner: async (req, res, next) => {
    const isMemberOrOwner = await shared.db.room.permissions.isMemberOrOwner(req.user, req.room)
    if(!isMemberOrOwner) {
      return next({ errorCode: shared.error.code.PERMISSION_DENIED, message:"Insufficient permission", httpCode: shared.api.http.code.UNAUTHORIZED })
    }
    next()
  },

}

module.exports = middleware
