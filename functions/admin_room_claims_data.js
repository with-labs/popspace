const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user || !user.admin) {
    return await lib.util.http.fail(
      callback,
      "Must be logged in as admin",
      { errorCode: lib.db.ErrorCodes.user.ADMIN_ONLY_RESTRICTED }
    )
  }

  const params = JSON.parse(event.body)
  params.email = util.args.consolidateEmailString(params.email)

  const claimData = await db.pg.massive.query(`
    SELECT
      room_claims.room_id, email, issued_at, emailed_at, resolved_at, name
    FROM
      room_claims JOIN room_names ON room_claims.room_id = room_names.room_id
  `)

  return await lib.util.http.succeed(callback, { data: claimData })
})
