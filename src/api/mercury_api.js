const Api = require("./api")
const http = require("./http")
const routes = require("./routes")

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
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(req.room.id, req.user.id)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry)
      return http.succeed(req, res, { otp: inviteRouteEntry.otp, inviteId: inviteRouteEntry.id })
    })

    this.api.memberOrOwnerRoomRouteEndpoint("/get_public_invite_details", async (req, res) => {
      const routeEntries = await shared.db.room.invites.getActivePublicInviteUrls(req.room.id)
      const inviteDetails = routeEntries.map((entry) => ({ inviteId: entry.id, otp: entry.otp }))
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
      if (!inviteId) {
        return http.fail(req, res, "Must provide inviteId", { errorCode: shared.error.code.INVALID_API_PARAMS })
      }
      const invite = await shared.db.room.invites.inviteById(inviteId)
      if (!invite) {
        return http.fail(req, res, "No such invite", { errorCode: shared.error.code.INVALID_INVITE })
      }
      const resolve = await shared.db.room.invites.joinRoomThroughPublicInvite(invite, req.user, otp)
      if (resolve.error) {
        if (resolve.error == shared.error.code.JOIN_ALREADY_MEMBER) {
          const roomNameEntry = await shared.db.rooms.preferredNameById(invite.room_id)
          return http.succeed(req, res, { roomRoute: roomNameEntry.name })
        }
        return http.fail(req, res, "Unable to become member.", { errorCode: resolve.error })
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

    this.api.memberOrOwnerRoomRouteEndpoint("/set_default_room", async (req, res) => {
      await shared.db.pg.massive.default_rooms.save({
        user_id: req.user.id,
        room_id: req.room.id,
      })
      return http.succeed(req, res)
    })

    this.api.loggedInPostEndpoint("/get_or_init_default_room", async (req, res) => {
      let defaultRoom = await shared.db.pg.massive.default_rooms.findOne({
        user_id: req.user.id,
      })

      // if no default_room row exists, we fallback to a heuristic -
      // choose an arbitrary owned room, if no owned rooms choose an arbitrary
      // membership room.
      if (!defaultRoom) {
        const firstOwnedRoom = await shared.db.pg.massive.rooms.findOne({
          owner_id: req.user.id,
        })
        if (firstOwnedRoom) {
          defaultRoom = {
            user_id: req.user.id,
            room_id: firstOwnedRoom.id,
          }
        } else {
          const firstRoomMembership = await shared.db.pg.massive.room_memberships.findOne({
            user_id: req.user.id,
          })
          if (firstRoomMembership) {
            return http.fail(req, res, lib.ErrorCodes.NO_DEFAULT_ROOM)
          }
          defaultRoom = {
            user_id: req.user.id,
            room_id: firstRoomMembership.room_id,
          }
        }
        // write the chosen default so it remains stable for future requests
        await shared.db.pg.massive.default_rooms.insert(defaultRoom)
      }

      const preferredRoute = await shared.db.rooms.latestMostPreferredRouteEntry(defaultRoom.room_id)
      if (!preferredRoute) {
        // TODO: log this, if a room doesn't have a route that represents a major problem in room setup
        return http.fail(req, res, "Unexpected error getting room information", {
          errorCode: lib.ErrorCodes.UNEXPECTED_ERROR,
        })
      }
      const preferredRouteName = preferredRoute.name
      return http.succeed(req, res, { room_route: preferredRouteName })
    })
  }
}

module.exports = MercuryApi
