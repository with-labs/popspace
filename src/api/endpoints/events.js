class Events {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/actor_event", async (req, res, params) => {
      /* Optional arg: { meta } (json) */
      const event = await shared.db.events.recordEvent(req.actor, params.key, params.value, req, req.body.meta)
      return api.http.succeed(req, res, { })
    }, ["key", "value"])


  }
}

module.exports = Events
