const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  await lib.init()

  const accounts = new lib.db.Accounts()
  const user = await lib.util.http.verifySessionAndGetUser(event, callback, accounts)
  if(!user) {
    return await lib.util.http.succeed(callback, { profile: null})
  }

  const rooms = new lib.db.Rooms()
  const profile = new lib.db.Profile(user)
  const userProfile = await profile.userProfile(rooms)

  return await lib.util.http.succeed(callback, { profile: userProfile })
}
