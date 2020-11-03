module.exports = {
  postEndpoint: (onReady) => {
    return async (event, context, callback) => {
      if(util.http.failUnlessPost(event, callback)) return;

      await lib.init()
      const middleware = await lib.util.middleware.init()
      await middleware.run(event, context)
      await onReady(event, context, callback)
    }
  }
}
