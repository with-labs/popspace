const http = require("./http")
const bodyParser = require("body-parser")
const cors = require("cors")
const base64Decode = (str) => Buffer.from(str, "base64").toString("utf-8")

const getUser = async (req, res, next) => {
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
}

const requireUser = async (req, res, next) => {
  if(!req.user) {
    return next({ errorCode: shared.error.code.UNAUTHORIZED_USER, message: "Must be logged in", httpCode: http.code.UNAUTHORIZED })
  }
  next()
}

const roomFromRoute = async (req, res, next) => {
  if(!req.body.room_route) {
    return next({ errorCode: shared.error.code.INVALID_API_PARAMS, message: "Must provide room_route" })
  }
  req.room = await shared.db.rooms.roomByRoute(req.body.room_route)
  next()
}

const requireRoom = async (req, res, next) => {
  if(!req.room) {
    return next({ errorCode: shared.error.code.UNKNOWN_ROOM, message: "Unknown room" })
  }
  next()
}

const requireRoomOwner = async (req, res, next) => {
  if(req.user.id != req.room.owner_id) {
    return next({ errorCode: shared.error.code.PERMISSION_DENIED, message: "Insufficient permission", httpCode: http.code.UNAUTHORIZED })
  }
  next()
}

const requireRoomMemberOrOwner = async (req, res, next) => {
  const isMemberOrOwner = await shared.db.room.permissions.isMemberOrOwner(req.user, req.room)
  if(!isMemberOrOwner) {
    return next({ errorCode: shared.error.code.PERMISSION_DENIED, message:"Insufficient permission", httpCode: http.code.UNAUTHORIZED })
  }
  next()
}

/*
  This should be restructured.

  One proposal is to export individual functions, and replace the constructor
  with a function; the actual middleware also become individually exported
  functions.

  https://github.com/with-labs/mercury/pull/8#discussion_r580298594
*/
class MercuryMiddleware {
  constructor(express) {
    this.express = express
    this.express.use(cors())
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use((req, res, next) => {
      req.body = lib.util.camelToSnakeCase(req.body)
      next()
    })
    this.express.use((req, res, next) => {
      req.mercury = {
        webUrl: lib.appInfo.webUrl(req),
        apiUrl: lib.appInfo.apiUrl(req),
      }
      next()
    })
  }

  getUser() {
    return getUser
  }

  requireUser() {
    return requireUser
  }

  roomFromRoute() {
    return roomFromRoute
  }

  requireRoom() {
    return requireRoom
  }

  requireRoomOwner() {
    return requireRoomOwner
  }

  requireRoomMemberOrOwner() {
    return requireRoomMemberOrOwner
  }
}

module.exports = MercuryMiddleware
