const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

/**
For now the main concern is scripting from inside a room
that could create an unlimited number of invites.
https://with.height.app/lets-ship-it/T-516
*/
const MAX_ROOM_INVITES = 200

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user) {
    return await lib.util.http.fail(
      callback,
      "Must be logged in",
      { errorCode: shared.error.code.UNAUTHORIZED }
    )
  }

  const params = context.params
  params.email = shared.lib.args.consolidateEmailString(params.email)
  const room = await shared.db.rooms.roomByName(params.roomName)
  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Non-existent room ${params.roomName}`,
      { errorCode: shared.error.code.UNKNOWN_ROOM }
    )
  }

  const inviterIsMember = await shared.db.room.memberships.isMember(user.id, room.id)
  const canInvite = (parseInt(room.owner_id) == parseInt(user.id))  || inviterIsMember
  if(!canInvite) {
    return await lib.util.http.fail(
      callback,
      `Only owners and members can invite to a room.`,
      { errorCode: shared.error.code.UNAUTHORIZED }
    )
  }

  if(user.email == params.email) {
    return await lib.util.http.fail(
      callback,
      "Can not invite yourself",
      { errorCode: shared.error.code.CANT_INVITE_SELF }
    )
  }

  const currentInvites = await shared.db.room.invites.getRoomInvites(room.id)
  const currentMembers = await shared.db.room.memberships.getRoomMembers(room.id)
  if((currentInvites.length + currentMembers.length) >= MAX_ROOM_INVITES) {
    return await lib.util.http.fail(
      callback,
      `Invite limit reached: ${currentInvites.length}/${MAX_ROOM_INVITES}`,
      { errorCode: shared.error.code.TOO_MANY_INVITES }
    )
  }

  const invitee = await shared.db.accounts.userByEmail(params.email)
  if(invitee) {
    const alreadyMember = await shared.db.room.memberships.isMember(invitee.id, room.id)
    if(alreadyMember) {
      return await lib.util.http.fail(
        callback,
        `${user.email} is already a member of this room.`,
        { errorCode: shared.error.code.ALREADY_INVITED }
      )
    }
  }

  const existingRoomInvitation = await shared.db.room.invites.latestRoomInvitation(room.id, params.email)
  if(existingRoomInvitation && !shared.lib.otp.isExpired(existingRoomInvitation)) {
    // This could be too strict, but should be ok to start
    // E.g. the email could have failed to deliver.
    // But to address those cases, we need to greatly improve our handling of emails,
    // so we know the reason it failed.
    return await lib.util.http.fail(
      callback,
      "Invite email already sent.",
      { errorCode: shared.error.code.ALREADY_INVITED }
    )
  }

  const invitation = await shared.db.room.invites.createInvitation(room.id, params.email)
  const inviteUrl = await lib.db.rooms.getInviteUrl(lib.util.env.appUrl(event, context), invitation)
  await lib.email.room.sendRoomInviteEmail(params.email, params.roomName, inviteUrl, user)

  const newMember = {
    display_name: "",
    email: params.email,
    user_id: null,
    avatar_url: null,
    has_accepted: false
  }

  return await lib.util.http.succeed(callback, { newMember })
})
