const { AccessToken } = require('livekit-server-sdk')
const { randomUUID } = require("crypto")
const Admin = require("./admin.js")

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY
const LIVEKIT_SECRET_KEY = process.env.LIVEKIT_SECRET_KEY

if (!LIVEKIT_API_KEY || !LIVEKIT_SECRET_KEY) {
  throw new Error('No media provider environment variables have been set. You must set LIVEKIT_API_KEY and LIVEKIT_SECRET_KEY for audio/video support.')
}

const getRoomUrl = (req, displayName, urlId) => {
  return `${lib.appInfo.webUrl(req)}/${shared.db.room.namesAndRoutes.getUrlName(displayName)}-${urlId}`
}

const UNLOCK_RATE_LIMIT_SCOPE = "unlock_room"

const parseRoomPassword = (body) => lib.roomPassword.parse(body.password)

const failUnlessCanCreateRooms = (req, res) => {
  if (lib.adminAuth.canCreateRooms(req.actor)) {
    return false
  }
  api.http.fail(req, res, {
    errorCode: shared.error.code.ADMIN_ONLY_RESTRICTED,
    message: "Only admins can create rooms"
  }, shared.api.http.code.FORBIDDEN)
  return true
}

const createRoom = async (template, actorId, sessionId, templateName, req, password = null) => {
  let { room, roomData } = await shared.db.room.core.createRoomFromTemplate(templateName, template, actorId)
  if (password) {
    room = await shared.db.room.core.setPassword(room.id, password)
  }
  const namedRoom = new shared.models.RoomWithState(room, roomData.state)
  const event = await shared.db.events.roomCreateEvent(actorId, sessionId, templateName, req)
  return namedRoom
}

class Meetings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/logged_in_join_room", async (req, res, params) => {
      const actor = req.actor
      const room = await shared.db.room.core.roomByRoute(params.roomRoute)

      if (!room) {
        return api.http.fail(req, res, { errorCode: shared.error.code.UNKNOWN_ROOM })
      }

      const canEnter = await shared.db.room.permissions.canEnter(actor, room)
      if (!canEnter) {
        return api.http.fail(req, res, room.passwordHash ? {
          errorCode: shared.error.code.ROOM_PASSWORD_REQUIRED,
          message: "This room requires a password"
        } : {
          errorCode: shared.error.code.UNAUTHORIZED_ROOM_ACCESS,
          message: "You don't have access to this room"
        }, shared.api.http.code.FORBIDDEN)
      }

      const token = new AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_SECRET_KEY,
        {
          identity: `${actor.id}#!${randomUUID()}`,
        }
      )
      token.addGrant({
        roomJoin: true,
        room: `${process.env.NODE_ENV}_${room.id}`,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      })

      return await api.http.succeed(req, res, { token: await token.toJwt() })
    }, ["roomRoute"])

    this.zoo.loggedInPostEndpoint("/unlock_room", async (req, res, params) => {
      const room = await shared.db.room.core.roomByRoute(params.roomRoute)
      if (!room) {
        return api.http.fail(req, res, { errorCode: shared.error.code.UNKNOWN_ROOM })
      }
      const attempt = lib.rateLimit.consume(UNLOCK_RATE_LIMIT_SCOPE, req)
      if (!attempt.allowed) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.RATE_LIMIT_EXCEEDED,
          message: lib.rateLimit.failureMessage("Room locked", attempt),
          attemptsLeft: 0
        }, shared.api.http.code.TOO_MANY_REQUESTS)
      }
      const valid = await shared.lib.password.verify(String(params.password), room.passwordHash)
      if (!valid) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.INCORRECT_ROOM_PASSCODE,
          message: lib.rateLimit.failureMessage("Incorrect password", attempt),
          attemptsLeft: attempt.attemptsLeft
        }, shared.api.http.code.FORBIDDEN)
      }
      lib.rateLimit.reset(UNLOCK_RATE_LIMIT_SCOPE, req)
      await shared.db.room.memberships.forceMembership(room, req.actor)
      return api.http.succeed(req, res)
    }, ["roomRoute", "password"])

    this.zoo.memberRoomRouteEndpoint("/remove_self_from_room", async (req, res) => {
      await shared.db.room.memberships.revokeMembership(req.room.id, req.actor.id)
      return api.http.succeed(req, res)
    })

    this.zoo.loggedInPostEndpoint("/create_meeting", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a serialized namedRoom
      */
      if (failUnlessCanCreateRooms(req, res)) {
        return
      }
      const password = parseRoomPassword(req.body)
      const customName = req.body.name ? String(req.body.name) : null
      if (customName) {
        // fail before creating anything if the name can't be used
        const check = await shared.db.room.core.checkVanityRoute(customName)
        if (!check.available) {
          return api.http.fail(req, res, {
            errorCode: check.reason === "taken" ? shared.error.code.ROOM_NAME_TAKEN : shared.error.code.INVALID_API_PARAMS,
            message: check.reason === "taken" ? `The name "${check.route}" is already taken` : "That room name can't be used",
            reason: check.reason
          })
        }
      }
      const namedRoom = await createRoom(req.body.template || null, req.actor.id, req.session.id, params.templateName, req, password)
      const newMeeting = { ...(await namedRoom.serialize()), passwordProtected: !!password }
      if (customName) {
        const result = await Admin.setCustomName(req, res, namedRoom.roomId(), customName)
          .catch(async (err) => {
            await shared.db.room.core.deleteRoom(namedRoom.roomId())
            throw err
          })
        if (!result) {
          // lost a race for the name; don't leave a stray room behind
          await shared.db.room.core.deleteRoom(namedRoom.roomId())
          return
        }
        Object.assign(newMeeting, {
          displayName: result.room.displayName,
          route: result.vanityRoute,
          vanityRoute: result.vanityRoute
        })
      }
      return api.http.succeed(req, res, { newMeeting })
    }, ["templateName"])

    this.zoo.loggedInPostEndpoint("/meeting_url", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a URL to it
      */
      if (failUnlessCanCreateRooms(req, res)) {
        return
      }
      const password = parseRoomPassword(req.body)
      const namedRoom = await createRoom(params.template, req.actor.id, req.session.id, params.templateName, req, password)

      return api.http.succeed(req, res, {
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId(),
        passwordProtected: !!password
      })
    }, ["template", "templateName"])

    this.zoo.loggedOutPostEndpoint("/anonymous_meeting", async (req, res, params) => {
      /*
        We allow creating meetings that aren't owned by anyone.

        Usually, we don't want to do this, but in some situations it's unavoidable.

        The reason we don't want to do this is because we'd prefer to know as much as possible
        about usage patterns around our core features. E.g. we'd like to know if the same
        person created many rooms - regardless of whether they signed up or not. We'd also like to know
        if a third party integration like a Slack app for noodle calls our API from the same
        actor (e.g. from the same Slack workspace, or the same slack account).

        However, we may be in a context where all we can do is call a URL and parse the result.
      */
      // rooms can only be created by signed-in admins
      if (!lib.adminAuth.canCreateRooms(req.actor)) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.ADMIN_ONLY_RESTRICTED,
          message: "Only admins can create rooms"
        }, shared.api.http.code.FORBIDDEN)
      }
      log.error.warn("/anonymous_meeting called - shouldn't be used yet, we don't have use cases")
      const namedRoom = await createRoom(params.template, null, null, params.templateName, req)
      return api.http.succeed(req, res, {
        warning: "don't use w/o making sure it's impossible otherwise",
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
      })
    }, ["template", "templateName"])
  }
}

module.exports = Meetings
