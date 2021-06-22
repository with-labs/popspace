

class Router {
  constructor(express, next) {
    this.express = express
    this.next = next
  }

  async init() {
    this.initApi()
    this.initNextJsRoutes()
    this.initErrors()
  }

  initApi() {
    (new (require('./endpoints'))(this.express)).init()
  }

  initNextJsRoutes() {
    (new (require("./pages"))(this.express, this.next)).init()
  }

  initErrors() {
    // catch 404 and forward to error handler
    this.express.use((req, res, next) => {
      const err = new Error('Not Found')
      err.status = 404
      next(err)
    })

    this.express.use((err, req, res, next) => {
      res.status(err.status || 500)
      res.locals.error = err
      res.locals.errorDescription = err.message
      this.next.render(req, res, "/_error", {  })
    })
  }
}

module.exports = Router
