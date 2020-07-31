require("dotenv").config()
const cryptoRandomString = require('crypto-random-string')
const db = require("db")
const utils = require("utils")

const accountRedis = new db.redis.AccountsRedis()
let pg = null

const getProfile = async (token) => {
  pg = await db.pg.init();
  const user = await pg.users.find({id: token.userId})
  return {
    user: user[0]
  }
}

module.exports.handler = async (event, context, callback) => {
  if(utils.http.failUnlessPost(event, callback)) return

  const params = JSON.parse(event.body)
  if(!params.token) {
    return utils.http.fail(callback, "Must specify authentication token")
  }
  let token = null
  try {
    token = JSON.parse(params.token)
  } catch {
    return utils.http.fail(callback, "Invalid token format")
  }

  const isValid = await utils.session.verifySessionToken(token, accountRedis)
  if(!isValid) {
    return utils.http.fail(callback, "Authentication failed")
  }

  const profile = await getProfile(token)

  utils.http.succeed(callback, {profile: profile})
}
