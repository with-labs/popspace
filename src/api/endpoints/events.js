var Mixpanel = require('mixpanel');
const MIXPANNEL_TOKEN = process.env.MIXPANNEL_TOKEN;

class Events {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
    if (MIXPANNEL_TOKEN) {
      this.mixpannel = Mixpanel.init(MIXPANNEL_TOKEN);
    }
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/actor_event", async (req, res, params) => {
      /* Optional arg: { meta } (json) */

      // if mixpannel is set up, we will send the event to mixpannel
      if (this.mixpannel) {
        this.mixpannel.track(params.key, {
          distinct_id: req.actor.id,
          value: params.value,
         ...req.body.meta 
        });
      }
      
      const event = await shared.db.events.recordEvent(req.actor.id, params.key, params.value, req, req.body.meta)
      return api.http.succeed(req, res, { })
    }, ["key", "value"])
  }
}

module.exports = Events
