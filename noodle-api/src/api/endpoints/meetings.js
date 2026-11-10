const TwilioAccessToken = require("twilio").jwt.AccessToken
const LivekitAccessToken = require('livekit-server-sdk').AccessToken
const VideoGrant = TwilioAccessToken.VideoGrant
const uuidv4 = require("uuid").v4

// 240 hours
// https://www.twilio.com/docs/chat/create-tokens
const MAX_ALLOWED_SESSION_SECONDS = 14400

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY
const LIVEKIT_SECRET_KEY = process.env.LIVEKIT_SECRET_KEY

// default to LiveKit
const USE_PROVIDER = process.env.LIVEKIT_API_KEY ? 'livekit' : 'twilio';

if (!TWILIO_ACCOUNT_SID && !LIVEKIT_API_KEY) {
  throw new Error('No media provider environment variables have been set. You must set either the TWILIO_ or LIVEKIT_ environment variables for audio/video support.')
}

const getRoomUrl = (req, displayName, urlId) => {
  return `${lib.appInfo.webUrl(req)}/${shared.db.room.namesAndRoutes.getUrlName(displayName)}-${urlId}`
}

const MIN_ROOM_PASSWORD_LENGTH = 12
const MAX_ROOM_PASSWORD_LENGTH = 128
const UNLOCK_RATE_LIMIT_SCOPE = "unlock_room"

// an empty or missing password means a public link
const parseRoomPassword = (body) => {
  const password = body.password
  if (password == null || password === "") {
    return null
  }
  if (typeof password !== "string" ||
      password.length < MIN_ROOM_PASSWORD_LENGTH ||
      password.length > MAX_ROOM_PASSWORD_LENGTH) {
    const error = new Error(`Room password must be ${MIN_ROOM_PASSWORD_LENGTH}-${MAX_ROOM_PASSWORD_LENGTH} characters`)
    error.errorCode = shared.error.code.INVALID_API_PARAMS
    throw error
  }
  return password
}

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

      if (USE_PROVIDER === 'twilio') {
        const userUuid4 = uuidv4()
        const token = new TwilioAccessToken(
          TWILIO_ACCOUNT_SID,
          TWILIO_API_KEY_SID,
          TWILIO_API_KEY_SECRET,
          {
            ttl: MAX_ALLOWED_SESSION_SECONDS
          }
        )

        token.identity = `${actor.id}#!${userUuid4}`
        const videoGrant = new VideoGrant({
          room: `${process.env.NODE_ENV}_${room.id}`
        })
        token.addGrant(videoGrant)

        return await api.http.succeed(req, res, { token: token.toJwt() })
      } else if (USE_PROVIDER === 'livekit') {
        const userUuid4 = uuidv4()
        const token = new LivekitAccessToken(
          LIVEKIT_API_KEY,
          LIVEKIT_SECRET_KEY,
          {
            identity: `${actor.id}#!${userUuid4}`,
          }
        )
        token.addGrant({
          roomJoin: true,
          room: `${process.env.NODE_ENV}_${room.id}`,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        })

        return await api.http.succeed(req, res, { token: token.toJwt() })
      } else {
        return await api.http.fail(req, res, { errorCode: 'UNKNOWN_PROVIDER' })
      }
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
      const namedRoom = await createRoom(req.body.template || null, req.actor.id, req.session.id, params.templateName, req, password)
      return api.http.succeed(req, res, {
        newMeeting: { ...(await namedRoom.serialize()), passwordProtected: !!password }
      })
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
