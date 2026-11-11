const RATE_LIMIT_SCOPE = "admin_login"

const requireAdmin = (req, res, next) => {
  if (lib.adminAuth.canCreateRooms(req.actor)) {
    return next()
  }
  return api.http.fail(req, res, {
    errorCode: shared.error.code.ADMIN_ONLY_RESTRICTED,
    message: "Only admins can manage rooms"
  }, shared.api.http.code.FORBIDDEN)
}

const roomFromParams = async (params) => {
  const roomId = parseInt(params.roomId)
  return Number.isInteger(roomId) ? await shared.db.room.core.roomById(roomId) : null
}

const failUnknownRoom = (req, res) => {
  return api.http.fail(req, res, {
    errorCode: shared.error.code.UNKNOWN_ROOM,
    message: "Unknown room"
  }, shared.api.http.code.NOT_FOUND)
}

// a name that is taken or invalid is a client error, not a server one
const setCustomName = async (req, res, roomId, name) => {
  try {
    return await shared.db.room.core.setCustomName(roomId, name)
  } catch (err) {
    if (err.errorCode === shared.error.code.ROOM_NAME_TAKEN) {
      api.http.fail(req, res, err, shared.api.http.code.CONFLICT)
      return null
    }
    if (err.errorCode === shared.error.code.INVALID_API_PARAMS) {
      api.http.fail(req, res, err)
      return null
    }
    throw err
  }
}

class Admin {
  constructor(zoo) {
    this.zoo = zoo
    this.initGet()
    this.initPost()
  }

  initGet() {
    this.zoo.loggedOutGetEndpoint("/auth_config", async (req, res) => {
      return api.http.succeed(req, res, { adminAuthEnabled: lib.adminAuth.isEnabled() })
    })

    this.zoo.loggedInGetEndpoint("/admin/rooms", async (req, res) => {
      const rooms = await shared.db.room.core.listRoomsForAdmin()
      return api.http.succeed(req, res, { rooms })
    }, [], [requireAdmin])
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/admin_login", async (req, res, params) => {
      if (!lib.adminAuth.isEnabled()) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.PERMISSION_DENIED,
          message: "Admin login is not configured"
        })
      }
      const attempt = lib.rateLimit.consume(RATE_LIMIT_SCOPE, req)
      if (!attempt.allowed) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.RATE_LIMIT_EXCEEDED,
          message: lib.rateLimit.failureMessage("Admin login locked", attempt),
          attemptsLeft: 0
        }, shared.api.http.code.TOO_MANY_REQUESTS)
      }
      if (!lib.adminAuth.checkCredentials(params.username, params.password)) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.INVALID_CREDENTIALS,
          message: lib.rateLimit.failureMessage("Invalid username or password", attempt),
          attemptsLeft: attempt.attemptsLeft
        }, shared.api.http.code.UNAUTHORIZED)
      }
      lib.rateLimit.reset(RATE_LIMIT_SCOPE, req)
      const actor = await shared.db.accounts.setAdmin(req.actor.id, true)
      const actorModel = new shared.models.Actor(actor)
      return api.http.succeed(req, res, { actor: await actorModel.serialize() })
    }, ["username", "password"])

    this.zoo.loggedInPostEndpoint("/admin_logout", async (req, res) => {
      const actor = await shared.db.accounts.setAdmin(req.actor.id, false)
      const actorModel = new shared.models.Actor(actor)
      return api.http.succeed(req, res, { actor: await actorModel.serialize() })
    })

    this.zoo.loggedInPostEndpoint("/admin/check_room_name", async (req, res, params) => {
      // optional, so it isn't in params
      const roomId = req.body.roomId == null ? null : parseInt(req.body.roomId)
      const check = await shared.db.room.core.checkVanityRoute(String(params.name), roomId)
      return api.http.succeed(req, res, check)
    }, ["name"], [requireAdmin])

    this.zoo.loggedInPostEndpoint("/admin/rename_room", async (req, res, params) => {
      const room = await roomFromParams(params)
      if (!room) {
        return failUnknownRoom(req, res)
      }
      const result = await setCustomName(req, res, room.id, params.name)
      if (!result) {
        return
      }
      return api.http.succeed(req, res, {
        displayName: result.room.displayName,
        vanityRoute: result.vanityRoute
      })
    }, ["roomId", "name"], [requireAdmin])

    this.zoo.loggedInPostEndpoint("/admin/set_room_password", async (req, res, params) => {
      /*
        Makes a room private with a new password, or public again with an
        empty one. A new password signs out everyone who joined before.
      */
      const room = await roomFromParams(params)
      if (!room) {
        return failUnknownRoom(req, res)
      }
      let password
      try {
        password = lib.roomPassword.parse(req.body.password)
      } catch (err) {
        return api.http.fail(req, res, err)
      }
      await shared.db.room.core.setPassword(room.id, password)
      return api.http.succeed(req, res, { passwordProtected: !!password })
    }, ["roomId"], [requireAdmin])

    this.zoo.loggedInPostEndpoint("/admin/delete_room", async (req, res, params) => {
      const room = await roomFromParams(params)
      if (!room) {
        return failUnknownRoom(req, res)
      }
      await shared.db.room.core.deleteRoom(room.id)
      return api.http.succeed(req, res)
    }, ["roomId"], [requireAdmin])
  }
}

Admin.setCustomName = setCustomName

module.exports = Admin
