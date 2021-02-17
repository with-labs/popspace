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
    /*
      There's a lot of repetition here.

      What are we going to do about it? I don't want to make a decision yet.

      There is a standard way of dealing with this in Rails that we could mirror.
      The js equivalent would be something like requireOwner(), requireMember() -
      but they'd have to throw exceptions, and we'd have to catch them... it would
      be quite verbose - there's no language support that I'm aware of.

      Another alternative is to have a zoo of endpoints types that have certain prerequisites,
      so it'd be more like ownerEndpoint((req, res) => ()), memberEndpoint(...), ...
    **/
    this.api.loggedInPostEndpoint("/enable_public_invite_link", async (req, res) => {
      if(!req.body.room_route) {
        /*
          It may be nice to introduce a general-purpose params verification system.
          I'll leave this for now as a reminder - I think the best point to make a decision here
          is when I'm refactoring the shared endpoint pre-requisites, like the room existance.
        */
        log.error.error(`Invalid enable_public_invite_link request ${JSON.stringify(req.body)}`)
        return http.fail(req, res, "Must provide room_route", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const room = await shared.db.rooms.roomByRoute(req.body.room_route)
      if(!room) {
        return http.fail(req, res, `Unknown room ${req.body.room_route}`, {errorCode: shared.error.code.UNKNOWN_ROOM})
      }
      if(req.user.id != room.owner_id) {
        return http.fail(req, res, "Insufficient permission", {errorCode: shared.error.code.PERMISSION_DENIED})
      }
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(room.id)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry)
      return http.succeed(req, res, { otp: inviteRouteEntry.otp, inviteId: inviteRouteEntry.id })
    })

    this.api.loggedInPostEndpoint("/get_public_invite_details", async (req, res) => {
      if(!req.body.room_route) {
        log.error.error(`Invalid get_public_invite_details request ${JSON.stringify(req.body)}`)
        return http.fail(req, res, "Must provide room_route", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const room = await shared.db.rooms.roomByRoute(req.body.room_route)
      if(!room) {
        return http.fail(req, res, "Unknown room", {errorCode: shared.error.code.UNKNOWN_ROOM})
      }
      const canGetRoute = await shared.db.room.permissions.isMemberOrOwner(req.user, room)
      if(!canGetRoute) {
        return http.fail(req, res, "Insufficient permission", {errorCode: shared.error.code.PERMISSION_DENIED})
      }
      const routeEntries = await shared.db.room.invites.getActivePublicInviteUrls(room.id)
      const inviteDetails = routeEntries.map((entry) => ({inviteId: entry.id, otp: entry.otp} ))
      return http.succeed(req, res, { inviteDetails })
    })

    this.api.loggedInPostEndpoint("/room_membership_through_shareable_link", async (req, res) => {
      const otp = req.body.otp
      const inviteId = req.body.invite_id
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

    this.api.loggedInPostEndpoint("/reset_public_invite_link", async (req, res) => {
      if(!req.body.room_route) {
        log.error.error(`Invalid reset_public_invite_link request ${JSON.stringify(req.user)}`)
        return http.fail(req, res, "Must provide room_route", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const room = await shared.db.rooms.roomByRoute(req.body.room_route)
      if(!room) {
        return http.fail(req, res, "Unknown room", {errorCode: shared.error.code.UNKNOWN_ROOM})
      }
      if(req.user.id != room.owner_id) {
        return http.fail(req, res, "Insufficient permission", {errorCode: shared.error.code.PERMISSION_DENIED})
      }
      await shared.db.room.invites.disablePublicInviteUrl(room.id)
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(room.id)
      const inviteRoute = routes.publicInviteRoute(inviteRouteEntry)
      return http.succeed(req, res, { otp: inviteRouteEntry.otp, inviteId: inviteRouteEntry.id })
    })

    this.api.loggedInPostEndpoint("/disable_public_invite_link", async (req, res) => {
      if(!req.body.room_route) {
        log.error.error(`Invalid disable_public_invite_link request ${JSON.stringify(req.body)}`)
        return http.fail(req, res, "Must provide room_route", {errorCode: shared.error.code.INVALID_API_PARAMS})
      }
      const room = await shared.db.rooms.roomByRoute(req.body.room_route)
      if(!room) {
        return http.fail(req, res, "Unknown room", {errorCode: shared.error.code.UNKNOWN_ROOM})
      }
      if(req.user.id != room.owner_id) {
        return http.fail(req, res, "Insufficient permission", {errorCode: shared.error.code.PERMISSION_DENIED})
      }
      const result = await shared.db.room.invites.disablePublicInviteUrl(room.id)
      return http.succeed(req, res)
    })
  }

}

module.exports = MercuryApi
