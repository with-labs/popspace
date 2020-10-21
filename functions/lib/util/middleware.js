class Middleware {
  constructor() {
    this.middleware = []
  }

  add(middleware) {
    this.middleware.push(middleware)
  }

  async run(event, context) {
    for(let i = 0; i < this.middleware.length; i++) {
      const stop = await this.middleware[i](event, context)
      if(stop) {
        return
      }
    }
  }
}

module.exports = Middleware
