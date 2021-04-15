const Api = require("./api")
const http = require("./http")
const routes = require("./routes")

const saveDefaultRoom = async (userId, roomId)  => {
  /*
    Sadly, massivejs doesn't really have an upsert
    https://massivejs.org/docs/persistence#save
    Perhaps we can make our own more generic,
    and not do this type of statement each time.
  */
  const existingDefault = await shared.db.pg.massive.default_rooms.findOne({user_id: userId})
  if(existingDefault) {
    return await shared.db.pg.massive.default_rooms.update({
      user_id: userId
    }, {
      room_id: roomId
    })
  } else {
    return await shared.db.pg.massive.default_rooms.insert({user_id: userId, room_id: roomId})
  }
}

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
    this.api.loggedInPostEndpoint("/subscribe_to_newsletter", async (req, res) => {
      await shared.db.accounts.newsletterSubscribe(req.user.id)
      return await http.succeed(req, res, {})
    })

    this.api.loggedInPostEndpoint("/unsubscribe_from_newsletter", async (req, res) => {
      await shared.db.accounts.newsletterUnsubscribe(req.user.id)
      return await http.succeed(req, res, {})
    })

    this.api.loggedOutPostEndpoint("/magic_link_subscribe", async (req, res) => {
      const magicLinkId = req.body.magic_link_id
      const otp = req.body.otp
      const request = await shared.db.magic.magicLinkById(magicLinkId)
      const result = await shared.db.magic.tryToSubscribe(request, otp)
      if (result.error) {
        return await http.authFail(req, res, result.error)
      }
      return await http.succeed(req, res, {})
    })

    this.api.loggedOutPostEndpoint("/magic_link_unsubscribe", async (req, res) => {
      const magicLinkId = req.body.magic_link_id
      const otp = req.body.otp
      const request = await shared.db.magic.magicLinkById(magicLinkId)
      const result = await shared.db.magic.tryToUnsubscribe(request, otp)
      if (result.error) {
        return await http.authFail(req, res, result.error)
      }
      return await http.succeed(req, res, {})
    })

    this.api.ownerOnlyRoomRouteEndpoint("/enable_public_invite_link", async (req, res) => {
      const roomState = await shared.db.dynamo.room.getRoomState(req.room.id)
      const inviteRouteEntry = await shared.db.room.invites.enablePublicInviteUrl(
        req.room.id,
        req.user.id,
        roomState.display_name
      )
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
      await saveDefaultRoom(req.user.id, req.room.id)
      return http.succeed(req, res)
    })

    this.api.loggedInPostEndpoint("/get_or_init_default_room", async (req, res) => {
      async function initializeDefaultRoom() {
        let initializedDefaultRoom

        const firstOwnedRoom = await shared.db.pg.massive.rooms.findOne({
          owner_id: req.user.id,
        })
        if (firstOwnedRoom) {
          initializedDefaultRoom = {
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
          initializedDefaultRoom = {
            user_id: req.user.id,
            room_id: firstRoomMembership.room_id,
          }
        }
        // write the chosen default so it remains stable for future requests
        await saveDefaultRoom(initializedDefaultRoom.user_id, initializedDefaultRoom.room_id)
        return initializedDefaultRoom
      }

      let defaultRoom = await shared.db.pg.massive.default_rooms.findOne({
        user_id: req.user.id,
      })

      // if no default_room row exists, we fallback to a heuristic -
      // choose an arbitrary owned room, if no owned rooms choose an arbitrary
      // membership room.
      if (!defaultRoom) {
        defaultRoom = await initializeDefaultRoom()
      }

      // if the user no longer has access to their default room,
      // re-initialize it
      if (!(await shared.db.room.memberships.hasAccess(req.user.id, defaultRoom.room_id))) {
        defaultRoom = await initializeDefaultRoom()
      }

      let preferredRoute = await shared.db.rooms.latestMostPreferredRouteEntry(defaultRoom.room_id)
      if (!preferredRoute) {
        // there's a good chance the room referenced by the existing default_rooms row
        // was deleted. re-initialize with a new default
        defaultRoom = await initializeDefaultRoom()
        preferredRoute = await shared.db.rooms.latestMostPreferredRouteEntry(defaultRoom.room_id)

        if (!preferredRoute) {
          return http.fail(req, res, "Unexpected error getting default room", {
            errorCode: lib.ErrorCodes.UNEXPECTED_ERROR,
          })
        }
      }
      const preferredRouteName = preferredRoute.name
      return http.succeed(req, res, { room_route: preferredRouteName })
    })

    this.api.loggedInPostEndpoint("/update_participant_state", async (req, res) => {
      try{
        await shared.db.dynamo.room.setParticipantState(req.user.id, req.body.participant_state)
        return http.succeed(req, res, { participantState: req.body.participantState })
      } catch(e) {
        if(e.code == 'ProvisionedThroughputExceededException') {
          log.error.error(`Dynamo throughput excededed: update participant state (user_id ${req.user.id}, body ${JSON.stringify(req.body)}) ${e})`)
          return http.fail(req, res, shared.error.code.RATE_LIMIT_EXCEEDED, `Widget database write capacity temporarily exceeded, please retry`)
        } else {
          log.error.error(`Unexpected error update participant state (user_id ${req.user.id}, body ${JSON.stringify(req.body)}) ${e}`)
          return http.fail(req, res, shared.error.code.UNEXPECTER_ERROR, `Could not write widget to database, please try again later.`)
        }
      }

    })

  }
}

module.exports = MercuryApi
