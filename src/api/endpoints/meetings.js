const AccessToken = require("twilio").jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant
const uuidv4 = require("uuid").v4

// 240 hours
// https://www.twilio.com/docs/chat/create-tokens
const MAX_ALLOWED_SESSION_SECONDS = 14400

/**
 * The various secret constants to access the Twilio API are stored in sereral
 * places. The file /.netlify.toml holds the TWILIO_API_KEYS_ENV values. They
 * are set based on the build context when Netlify makes a build.
 * (https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
 *
 * The TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_KEY_SECRET
 * are stored inside the Netlify admin panel. They are injected during build.
 * Also, during local development, they are pulled down from the servers. So,
 * your local app (netlify dev), has access to the same API keys as when a
 * build is made on the Netlify servers.
 */

// the Twilio Account SID is universal for all services
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
// This value comes from netlify.toml, and is a based on Netlify build context
// It is either "production" or "development"
const TWILIO_API_KEYS_ENV = process.env.TWILIO_API_KEYS_ENV
// These API keys were generated inside the Twilio admin panel, then are stored
// inside the Netlify admin panel.
const TWILIO_API_KEYS = {
  development: {
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID_DEV,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET_DEV
  },
  production: {
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID_PROD,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET_PROD
  }
}

// If you have access to the Netlify environment context, use it to determien
// which API keys to use. Otherwise, fallback to the 'development' API keys.
const TWILIO_API_KEY_SID = TWILIO_API_KEYS[TWILIO_API_KEYS_ENV]
  ? TWILIO_API_KEYS[TWILIO_API_KEYS_ENV].TWILIO_API_KEY_SID
  : TWILIO_API_KEYS["development"].TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = TWILIO_API_KEYS[TWILIO_API_KEYS_ENV]
  ? TWILIO_API_KEYS[TWILIO_API_KEYS_ENV].TWILIO_API_KEY_SECRET
  : TWILIO_API_KEYS["development"].TWILIO_API_KEY_SECRET


const getRoomUrl = (req, displayName, urlId) => {
  return `${lib.appInfo.webUrl(req)}/${shared.db.room.namesAndRoutes.getUrlName(displayName)}-${urlId}`
}

const createRoom = async (template, actorId) => {
    const { room, roomData } = await shared.db.room.core.createRoomFromTemplate(template, actorId)
    const namedRoom = new shared.models.RoomWithState(room, roomData.state)
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
      const room = await shared.db.room.core.roomByRoute(params.room_route)

      if (!room) {
        return api.http.fail(req, res, { errorCode: shared.error.code.UNKNOWN_ROOM })
      }

      const userUuid4 = uuidv4()
      const token = new AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        {
          ttl: MAX_ALLOWED_SESSION_SECONDS
        }
      )

      // TODO: use User ID from our database
      token.identity = `${actor.id}#!${userUuid4}`
      const videoGrant = new VideoGrant({
        room: `${process.env.NODE_ENV}_${room.id}`
      })
      token.addGrant(videoGrant)

      return await api.http.succeed(req, res, { token: token.toJwt() })
    }, ["room_route"])

    this.zoo.memberRoomRouteEndpoint("/remove_self_from_room", async (req, res) => {
      await shared.db.room.memberships.revokeMembership(req.room.id, req.actor.id)
      return api.http.succeed(req, res)
    })

    this.zoo.loggedInPostEndpoint("/create_meeting", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a serialized namedRoom
      */
      const namedRoom = await createRoom(params.template, req.actor.id)
      return api.http.succeed(req, res, { newMeeting: await namedRoom.serialize() })
    }, ["template"])

    this.zoo.loggedInPostEndpoint("/meeting_url", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a URL to it
      */
      const namedRoom = await createRoom(params.template, req.actor.id)
      return api.http.succeed(req, res, {
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
      })
    }, ["template"])

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
      log.error.warn("/anonymous_meeting called - shouldn't be used yet, we don't have use cases")
      const namedRoom = await createRoom(params.template, null)
      return api.http.succeed(req, res, {
        warning: "don't use w/o making sure it's impossible otherwise",
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
      })
    }, ["template"])
  }
}

module.exports = Meetings
