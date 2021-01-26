const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const validExistingClaim = (claimResult, email, roomName) => {
  if(claimResult.error != shared.error.code.CLAIM_UNIQUENESS) {
    return false
  }
  return claimResult.claim &&
          claimResult.claim.email == email &&
          claimResult.roomNameEntry.name == roomName
}

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user || !user.admin) {
    return await lib.util.http.fail(
      callback,
      "Must be logged in as admin",
      { errorCode: shared.error.code.ADMIN_ONLY_RESTRICTED }
    )
  }

  const params = JSON.parse(event.body)
  params.email = shared.lib.args.consolidateEmailString(params.email)
  params.roomName = params.roomName || await shared.db.rooms.generateUniqueRoomId()

  const allowRegistered = true
  const createNewRooms = true
  const allowTransfer = false
  const claimResult = await shared.db.room.claims.tryToCreateClaim(params.email, params.roomName, allowRegistered, createNewRooms, allowTransfer)

  if(claimResult.error && !validExistingClaim(claimResult, params.email, params.roomName)) {
    return await lib.util.http.fail(callback,
      "Something went wrong",
      { errorCode: claimResult.error }
    )
  }

  const url = await lib.db.rooms.getClaimUrl(lib.util.env.appUrl(event, context), claimResult.claim)
  try {
    await shared.db.room.claims.claimUpdateEmailedAt(claimResult.claim.id)
    await lib.email.room.sendRoomClaimEmail(params.email, params.roomName, url)
  } catch(e) {
    return await lib.util.http.fail(callback,
      "Unable to send email",
      { errorCode: shared.error.code.UNEXPECTER_ERROR }
    )
  }

  return await lib.util.http.succeed(callback, { })
})
