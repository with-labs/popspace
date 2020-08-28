const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  const accounts = new lib.db.Accounts()
  await accounts.init()
  const user = await lib.util.http.verifySessionAndGetUser(event, callback, accounts)
  if(!user) {
    return lib.util.http.succeed(callback, { profile: null})
  }

  const rooms = new lib.db.Rooms()
  await rooms.init()

  const profile = new lib.db.Profile(user)
  const userProfile = await profile.userProfile(rooms)

  await accounts.cleanup()
  await rooms.cleanup()
  lib.util.http.succeed(callback, { profile: userProfile })
}
