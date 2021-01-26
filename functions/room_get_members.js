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
        display_name: member.display_name,
        email: member.email,
        user_id: member.id,
        avatar_url: member.avatar_url,
        has_accepted: true
      })
      assembledEmails.add(member.email)
    }
  })

  const invites = await shared.db.room.invites.getRoomInvites(room.id)
  const invitedUsers = await shared.db.accounts.usersByEmails(invites.map((i) => (i.email)))
  const userByEmail = {}
  invitedUsers.map((iu) => (userByEmail[iu.email] = iu))

  invites.map((invite) => {
    if(!assembledEmails.has(invite.email)) {
      assembledEmails.add(invite.email)
      const user = userByEmail[invite.email]
      if(user) {
        result.push({
          display_name: user.display_name,
          email: user.email,
          user_id: user.id,
          avatar_url: user.avatar_url,
          has_accepted: false
        })
      } else {
        result.push({
          email: invite.email,
          has_accepted: false,
          display_name: null,
          user_id: null,
          avatar_url: null
        })
      }

    }
  })

  return await lib.util.http.succeed(callback, { result: result })
})
