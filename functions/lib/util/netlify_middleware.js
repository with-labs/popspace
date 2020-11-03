const Middleware = require("./middleware")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

let initialized = false
let middleware = null

const allowReturnFromEmptyEventLoop = async (event, context) => {
  // https://www.jeremydaly.com/reuse-database-connections-aws-lambda/
  context.callbackWaitsForEmptyEventLoop = false
  return false
}

const parseParams = async (event, context) => {
  const body = JSON.parse(event.body)
  context.params = body || {}
  return false
}

const base64Decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

const getUser = async (event, context) => {
  // support Authorization header with a bearer token,
  // fallback to a `token` field on a POST body
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = (authHeader && authHeader.startsWith('Bearer')) ? base64Decode(authHeader.replace('Bearer ', '')) : context.params.token;

  if(!token) {
    return false
  }
  const session = await db.accounts.sessionFromToken(token)
  if(!session) {
    return false
  }
  const userId = parseInt(session.user_id)
  const user = await db.accounts.userById(userId)
  if(!user) {
    return false
  }
  context.user = user
  return false
}

module.exports = {
  init: async () => {
    await lock.acquire('with_netlify_middleware', async () => {
      if(middleware) {
        // Protect against netlify race conditions for warm context reuse
        return
      }
      middleware = new Middleware()
      const result = []

      middleware.add(allowReturnFromEmptyEventLoop)
      middleware.add(parseParams)
      middleware.add(getUser)

      return middleware

    })
    return middleware
  }
}
