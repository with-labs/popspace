const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const MAX_ROOM_INVITES = 20

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user) {
    return await lib.util.http.fail(
      callback,
      "Must be logged in",
      { errorCode: lib.db.ErrorCodes.user.UNAUTHORIZED }
    )
  }

  const params = context.params
  params.email = util.args.consolidateEmailString(params.email)
  const room = await lib.db.rooms.roomByName(params.roomName)
  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Non-existent room ${params.roomName}`,
      { errorCode: lib.db.ErrorCodes.room.UNKNOWN_ROOM }
    )
  }

  if(parseInt(room.owner_id) != parseInt(user.id)) {
    return await lib.util.http.fail(
      callback,
      `You are not currently logged in as the owner of that room.`,
      { errorCode: lib.db.ErrorCodes.user.UNAUTHORIZED }
    )
  }

  if(user.email == params.email) {
    return await lib.util.http.fail(
      callback,
      "Can not invite yourself",
      { errorCode: lib.db.ErrorCodes.room.CANT_INVITE_SELF }
    )
  }

  const currentInvites = await db.rooms.getRoomInvites(room.id)
  const currentMembers = await db.rooms.getRoomMembers(room.id)
  if((currentInvites.length + currentMembers.length) >= MAX_ROOM_INVITES) {
    return await lib.util.http.fail(
      callback,
      `Invite limit reached: ${currentInvites.length}/${MAX_ROOM_INVITES}`,
      { errorCode: lib.db.ErrorCodes.room.TOO_MANY_INVITES }
    )
  }

  const invitee = await db.accounts.userByEmail(params.email)
  if(invitee) {
    const alreadyMember = await db.rooms.isMember(invitee.id, room.id)
    if(alreadyMember) {
      return await lib.util.http.fail(
        callback,
        `${user.email} is already a member of this room.`,
        { errorCode: lib.db.ErrorCodes.room.ALREADY_INVITED }
      )
    }
  }

  const existingRoomInvitation = await db.rooms.latestRoomInvitation(room.id, params.email)
  if(existingRoomInvitation && !db.otp.isExpired(existingRoomInvitation)) {
    // This could be too strict, but should be ok to start
    // E.g. the email could have failed to deliver.
    // But to address those cases, we need to greatly improve our handling of emails,
    // so we know the reason it failed.
    return await lib.util.http.fail(
      callback,
      "Invite email already sent.",
      { errorCode: lib.db.ErrorCodes.room.ALREADY_INVITED }
    )
  }

  const invitation = await db.rooms.createInvitation(room.id, params.email)
  const inviteUrl = await db.rooms.getInviteUrl(lib.util.env.appUrl(event, context), invitation)
  lib.email.room.sendRoomInviteEmail(params.email, params.roomName, inviteUrl)

  const newMember = {
    display_name: "",
    email: params.email,
    user_id: null,
    avatar_url: null,
    has_accepted: false
  }

  return await lib.util.http.succeed(callback, { newMember })
})
