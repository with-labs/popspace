const { shared } = require("../lib/_lib")
const Zoo = require("./zoo")
const NoodleMiddleware = require("./noodle_middleware")
const http = require("./http")

const carefulDynamoCall = async (endpoint, req, res, f) => {
  try {
    f()
  } catch(e) {
    if(e.code == 'ProvisionedThroughputExceededException') {
      log.error.error(`Dynamo throughput excededed (${endpoint}): (user_id ${req.user.id}, body ${JSON.stringify(req.body)})\n${e})`)
      e.errorCode = shared.error.code.RATE_LIMIT_EXCEEDED
      e.message = `Widget database write capacity temporarily exceeded, please retry`
      return http.fail(req, res, e)
    } else {
      log.error.error(`Unexpected error (${endpoint}) (user_id ${req.user.id}, body ${JSON.stringify(req.body)})\n${e}`)
      e.errorCode = shared.error.code.UNEXPECTER_ERROR
      e.message = `Could not complete request: ${e.message}`
      return http.fail(req, res, e)
    }
  }
}

class NoodleApi {
  constructor(express) {
    this.zoo = new Zoo(express)
    this.middleware = new NoodleMiddleware(express)
    this.initPostRoutes()
    /*
      Make sure to run this last so we can handle errors
      for all endpoints
    */
    this.zoo.setupGenericErrorHandling()
  }

  initPostRoutes() {
    /*
      For now we can write routes in a flat list here.

      Once we're past ~10 or so endpoints, we can start trying to organize them.
    */
    this.zoo.loggedInPostEndpoint("/profile", async (req, res) => {
      await carefulDynamoCall("/profile", req, res, async () => {
        const profile = new shared.models.Profile(req.user.id)
        const serialized = await profile.serialize()
        return http.succeed(req, res, { profile: serialized } )
      })
    })

  }
}

module.exports = NoodleApi
