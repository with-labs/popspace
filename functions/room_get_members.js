const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user) {
    /* TODO: We may want to enable this for logged out users later. Some options:
       1. Establish logged out permission tokens
       2. Cache whatever credential authenticated users on the front end, and re-verify that
          (i.e. the password for password-protected rooms)
    */
    return await lib.util.http.fail(
      callback,
      "Must be logged in",
      { errorCode: shared.error.code.UNAUTHORIZED }
    )
  }

  const room = await shared.db.rooms.roomByName(context.params.roomName)
  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Non-existent room ${params.roomName}`,
      { errorCode: shared.error.code.UNKNOWN_ROOM }
    )
  }

  const members = await shared.db.room.memberships.getRoomMembers(room.id)
  const assembledEmails = new Set()
  const result = []

  members.forEach((member) => {
    if(!assembledEmails.has(member.email)) {
      result.push({
        displayName: member.display_name,
        email: member.email,
        userId: member.id,
        avatarName: member.participantState ? member.participantState.avatar_name : null,
        hasAccepted: true
      })
      assembledEmails.add(member.email)
    }
  })

  const invites = await shared.db.room.invites.getRoomInvites(room.id)
  const invitedUsers = await shared.db.accounts.usersByEmails(invites.map((i) => (i.email)))
  const userByEmail = {}
  invitedUsers.map((iu) => (userByEmail[iu.email] = iu))

  invites.map(async (invite) => {
    if(!assembledEmails.has(invite.email)) {
      assembledEmails.add(invite.email)
      const user = userByEmail[invite.email]
      if(user) {
        // grab participantState for invited users as a stop gap until we
        // move off of netlify
        const participantState = await shared.db.dynamo.room.getParticipantState(user.id)
        result.push({
          displayName: user.display_name,
          email: user.email,
          userId: user.id,
          avatarName: participantState ? participantState.avatar_name : null,
          hasAccepted: false
        })
      } else {
        result.push({
          email: invite.email,
          hasAccepted: false,
          displayName: null,
          userId: null,
          avatarName: null
        })
      }

    }
  })

  return await lib.util.http.succeed(callback, { result: result })
})
