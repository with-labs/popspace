const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const validExistingClaim = (claimResult, email, roomName) => {
  if(claimResult.error != lib.db.ErrorCodes.room.CLAIM_UNIQUENESS) {
    return false
  }
  return claimResult.claim &&
          claimResult.claim.email == email &&
          claimResult.roomNameEntry.name == roomName
}

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  await lib.init()

  const user = await lib.util.http.verifySessionAndGetUser(event, callback, lib.db.accounts)
  if(!user || !user.admin) {
    return await lib.util.http.fail(
      callback,
      "Must be logged in as admin",
      { errorCode: lib.db.ErrorCodes.user.ADMIN_ONLY_RESTRICTED }
    )
  }

  const params = JSON.parse(event.body)
  params.email = util.args.consolidateEmailString(params.email)

  const allowRegistered = true
  const createNewRooms = true
  const allowTransfer = false
  const claimResult = await db.rooms.tryToCreateClaim(params.email, params.roomName, allowRegistered, createNewRooms, allowTransfer)

  if(claimResult.error && !validExistingClaim(claimResult, params.email, params.roomName)) {
    return await lib.util.http.fail(callback,
      "Something went wrong",
      { errorCode: claimResult.error }
    )
  }

  const url = await db.rooms.getClaimUrl(lib.util.env.appUrl(event, context), claimResult.claim)
  try {
    await lib.db.rooms.claimUpdateEmailedAt(claimResult.claim.id)
    await lib.email.room.sendRoomClaimEmail(params.email, params.roomName, url)
  } catch(e) {
    console.log(e)
    return await lib.util.http.fail(callback,
      "Unable to send email",
      { errorCode: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    )
  }

  return await lib.util.http.succeed(callback, { })
}
