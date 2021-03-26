const Api = require("./api")
const http = require("./http")
const routes = require('./routes')

class MercuryApi {
  constructor(mercury) {
    this.mercury = mercury
    this.api = new Api(mercury.getExpress())
    this.initPostRoutes()
    /*
      Make sure to run this last so we can handle errors
      for all endpoints
    */
    this.api.setupGenericErrorHandling()
  }

  initPostRoutes() {
    this.api.ownerOnlyRoomRouteEndpoint("/enable_public_invite_link", async (req, res) => {
      const roomState = await shared.db.dynamo.room.getRoomState(req.room.id)
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(req.room.id, req.user.id, roomState.display_name)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry)
      return http.succeed(req, res, { otp: inviteRouteEntry.otp, inviteId: inviteRouteEntry.id })
    })

    this.api.memberOrOwnerRoomRouteEndpoint("/get_public_invite_details", async (req, res) => {
      const routeEntries = await shared.db.room.invites.getActivePublicInviteUrls(req.room.id)
      const inviteDetails = routeEntries.map((entry) => ({inviteId: entry.id, otp: entry.otp} ))
      return http.succeed(req, res, { inviteDetails })
    })

    this.api.loggedInPostEndpoint("/room_membership_through_public_invite_link", async (req, res) => {
      /**
        We currently committed to not limiting the number of memberships, with
        a quick followup of limiting the number of participants
        https://withlabs.slack.com/archives/C017MFP9142/p1613676951294300
      */
      const otp = req.body.otp
      const inviteId = req.body.invite_id
      if(!inviteId) {
        return http.fail(req, res, "Must provide inviteId", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const invite = await shared.db.room.invites.inviteById(inviteId)
      if(!invite) {
        return http.fail(req, res,  "No such invite", { errorCode: shared.error.code.INVALID_INVITE })
      }
      const resolve = await shared.db.room.invites.joinRoomThroughPublicInvite(invite, req.user, otp)
      if(resolve.error) {
        if(resolve.error == shared.error.code.JOIN_ALREADY_MEMBER) {
          const roomNameEntry = await shared.db.rooms.preferredNameById(invite.room_id)
          return http.succeed(req, res, { roomRoute: roomNameEntry.name })
        }
        return http.fail(req, res, "Unable to become member.", { errorCode: resolve.error} )
      }
      const roomNameEntry = await shared.db.rooms.preferredNameById(invite.room_id)
      return http.succeed(req, res, { roomRoute: roomNameEntry.name })
    })

    this.api.ownerOnlyRoomRouteEndpoint("/reset_public_invite_link", async (req, res) => {
      await shared.db.room.invites.disablePublicInviteUrl(req.room.id)
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(req.room.id)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry)
      return http.succeed(req, res, { otp: inviteRouteEntry.otp, inviteId: inviteRouteEntry.id })
    })

    this.api.ownerOnlyRoomRouteEndpoint("/disable_public_invite_link", async (req, res) => {
      const result = await shared.db.room.invites.disablePublicInviteUrl(req.room.id)
      return http.succeed(req, res)
    })
  }

}

module.exports = MercuryApi
