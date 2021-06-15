const getRoomUrl = (req, displayName, urlId) => {
  return `${lib.appInfo.webUrl(req)}/${shared.db.room.namesAndRoutes.getUrlName(displayName)}-${urlId}`
}

const createRoom = async (template, userId) => {
    const { room, roomData } = await shared.db.room.core.createRoomFromTemplate(template, userId)
    const namedRoom = new shared.models.NamedRoom(room, roomData.state)
    return namedRoom
}

class Meetings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.memberRoomRouteEndpoint("/remove_self_from_room", async (req, res) => {
      await shared.db.room.memberships.revokeMembership(req.room.id, req.actor.id)
      return http.succeed(req, res)
    })

    this.zoo.loggedInPostEndpoint("/create_meeting", async (req, res) => {
      /*
        Creates a meeting from a template and returns a serialized namedRoom
      */
      const namedRoom = await createRoom(req.body.template, req.user.id)
      return api.http.succeed(req, res, { newMeeting: namedRoom.serialize() })
    })

    this.zoo.loggedInPostEndpoint("/meeting_url", async (req, res) => {
      /*
        Creates a meeting from a template and returns a URL to it
      */
      const namedRoom = await createRoom(req.body.template, req.user.id)
      return api.http.succeed(req, res, {
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
      })
    })

    this.zoo.loggedOutPostEndpoint("/anonymous_meeting", async (req, res) => {
      /*
        We allow creating meetings that aren't owned by anyone.

        Usually, we don't want to do this, but in some situations it's unavoidable.

        The reason we don't want to do this is because we'd prefer to know as much as possible
        about usage patterns around our core features. E.g. we'd like to know if the same
        person created many rooms - regardless of whether they signed up or not. We'd also like to know
        if a third party integration like a Slack app for noodle calls our API from the same
        user (e.g. from the same Slack workspace, or the same slack account).

        However, we may be in a context where all we can do is call a URL and parse the result.
      */
      log.error.warn("/anonymous_meeting called - shouldn't be used yet, we don't have use cases")
      const namedRoom = await createRoom(req.body.template, null)
      return api.http.succeed(req, res, {
        warning: "don't use w/o making sure it's impossible otherwise",
        url: getRoomUrl(req, namedRoom.displayName(), namedRoom.urlId()),
        urlId: namedRoom.urlId()
      })
    })
  }
}

module.exports = Meetings
