const Api = require("./api")
const http = require("./http")
const routes = require('./routes')

class MercuryApi {
  constructor(mercury) {
    this.mercury = mercury
    this.api = new Api(mercury.getExpress())
    this.initPostRoutes()
  }

  initPostRoutes() {
    this.api.loggedOutGetEndpoint("/hello", async (req, res) => {
      http.succeed(req, res, {hello: 'world'})
    })

    this.api.loggedInPostEndpoint("/enable_public_invite_link", async (req, res) => {
      if(!req.body.room_id) {
        log.error.error(`Invalid enable_public_invite_link request ${JSON.stringify(req.user)}`)
        return http.fail(req, res, "Must provide room_id", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const room = await shared.db.rooms.roomById(req.body.room_id)
      if(!room) {
        return http.fail(req, res, "Unknown room", {error: shared.error.code.UNKNOWN_ROOM})
      }
      if(req.user.id != room.owner_id) {
        return http.fail(req, res, "Insufficient permission", {errorCode: shared.error.code.PERMISSION_DENIED})
      }
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(req.body.room_id)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry.otp)
      http.succeed(req, res, { inviteRoute })
    })

    this.api.loggedInPostEndpoint("/get_public_invite_urls", async (req, res) => {
      const inviteUrls = await shared.db.room.invites.getActivePublicInviteUrls(req.body.room_id)
      http.succeed(req, res, { inviteUrls })
    })

    this.api.loggedInPostEndpoint("/disable_public_invite_link", async (req, res) => {
      const result = await shared.db.room.invites.disablePublicInviteUrl(req.body.room_id)
      http.succeed(req, res)
      const socketGroup = this.mercury.getSocketGroup(req.body.room_id)
      if(socketGroup) {
        socketGroup.broadcastRoomStateFieldChanged("public_invite_link", { inviteUrls: [] })
      }
    })
  }

}

module.exports = MercuryApi
