const Middleware = require("./middleware")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

let initialized = false
let middleware = null

module.exports = {
  init: async () => {
    await lock.acquire('with_netlify_middleware', async () => {
      if(middleware) {
        // Protect against netlify race conditions for warm context reuse
        return
      }
      middleware = new Middleware()
      const result = []

      middleware.add(async (event, context) => {
        context.callbackWaitsForEmptyEventLoop = false
        return false
      })

      middleware.add(async (event, context) => {
        const body = JSON.parse(event.body)
        context.params = body || {}
        return false
      })

      middleware.add(async (event, context) => {
        if(!context.params.token) {
          return false
        }
        const session = await accounts.sessionFromToken(params.token)
        if(!session) {
          return false
        }
        const userId = parseInt(session.user_id)
        const user = await accounts.userById(userId)
        if(!user) {
          return false
        }
        context.user = user
        return false
      })

      return middleware

    })
    return middleware
  }
}
