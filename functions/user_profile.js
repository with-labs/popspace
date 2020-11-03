const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  if(!context.user) {
    return await lib.util.http.succeed(callback, { profile: null })
  }

  const rooms = new lib.db.Rooms()
  const profile = new lib.db.Profile(context.user)
  const userProfile = await profile.userProfile(rooms)

  return await lib.util.http.succeed(callback, { profile: userProfile })
})
