const AccessToken = require("twilio").jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant
const uuidv4 = require("uuid").v4

// 240 hours
// https://www.twilio.com/docs/chat/create-tokens
const MAX_ALLOWED_SESSION_SECONDS = 14400

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET

const getRoomUrl = (req, displayName, urlId) => {
  return `${lib.appInfo.webUrl(req)}/${shared.db.room.namesAndRoutes.getUrlName(displayName)}-${urlId}`
}

const createRoom = async (template, actorId, sessionId, templateName, req) => {
  const { room, roomData } = await shared.db.room.core.createRoomFromTemplate(templateName, template, actorId)
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
    }, ["roomRoute"])

    this.zoo.memberRoomRouteEndpoint("/remove_self_from_room", async (req, res) => {
      await shared.db.room.memberships.revokeMembership(req.room.id, req.actor.id)
      return api.http.succeed(req, res)
    })

    this.zoo.loggedInPostEndpoint("/create_meeting", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a serialized namedRoom
      */
      const namedRoom = await createRoom(req.body.template || null, req.actor.id, req.session.id, params.templateName, req)
      return api.http.succeed(req, res, { newMeeting: await namedRoom.serialize() })
    }, ["templateName"])

    this.zoo.loggedInPostEndpoint("/meeting_url", async (req, res, params) => {
      /*
        Creates a meeting from a template and returns a URL to it
      */
      const namedRoom = await createRoom(params.template, req.actor.id, req.session.id, params.templateName, req)

      return api.http.succeed(req, res, {
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
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
