  const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const getProfile = (user) => {
  return {
    user: user
  }
}

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  const params = JSON.parse(event.body)
  if(!params.token) {
    return lib.util.http.fail(callback, "Must specify authentication token")
  }

  const accounts = new lib.db.Accounts()
  await accounts.init()

  const session = await accounts.sessionFromToken(params.token)

  if(!session) {
    return lib.util.http.fail(callback, "Authentication failed")
  }

  const user = await accounts.userById(parseInt(session.user_id))
  await accounts.cleanup()
  lib.util.http.succeed(callback, { profile: getProfile(user) })
}
