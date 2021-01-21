module.exports = {
  postEndpoint: (onReady) => {
    return async (event, context, callback) => {
      if (util.http.failUnlessPost(event, callback)) return

      try {
        await lib.init()
        const middleware = await lib.util.middleware.init()
        await middleware.run(event, context)
        await onReady(event, context, callback)
      } catch (err) {
        // handle any uncaught errors in the request with
        // the equivalent of a 500
        console.error("Unexpected error during request", err)
        await lib.util.http.fail(callback, "Unexpected error", {
          errorCode: lib.db.ErrorCodes.UNEXPECTED_ERROR
        })
      }
    }
  },

  publicPostEndpoint: (onReady) => {
    // no authentication required
    return async (event, context, callback) => {
      if(util.http.failUnlessPost(event, callback)) return;

      await lib.init()
      await onReady(event, context, callback)
    }
  },

  getEndpoint: (onReady) => {
    return async (event, context, callback) => {
      try {
        await lib.init()
        const middleware = await lib.util.middleware.init()
        await middleware.run(event, context)
        await onReady(event, context, callback)
      } catch (err) {
        // handle any uncaught errors in the request with
        // the equivalent of a 500
        console.error("Unexpected error during request", err)
        await lib.util.http.fail(callback, "Unexpected error", {
          errorCode: lib.db.ErrorCodes.UNEXPECTED_ERROR
        })
      }
    }
  }
}
