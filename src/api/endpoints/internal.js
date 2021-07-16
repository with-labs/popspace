class Internal {
  constructor(zoo) {
    this.zoo = zoo
    this.initGet()
  }

  initGet() {
    const startTime = new Date().getTime()
    this.zoo.loggedOutGetEndpoint("/health", async (req, res, params) => {
      const now = new Date().getTime()
      return api.http.succeed(req, res, { uptime: now - startTime, startTime })
    })
  }
}

module.exports = Internal
