const carefulDynamoCall = async (endpoint, req, res, f) => {
  /*
    TODO: what I _really_ want to do is get rid of Dynamo (and thus this function).
    Second best - get this out into some sort of endpoints helper util lib tool class
  */
  try {
    f()
  } catch(e) {
    if(e.code == 'ProvisionedThroughputExceededException') {
      log.error.error(`Dynamo throughput excededed (${endpoint}): (user_id ${req.user.id}, body ${JSON.stringify(req.body)})\n${e})`)
      e.errorCode = shared.error.code.RATE_LIMIT_EXCEEDED
      e.message = `Widget database write capacity temporarily exceeded, please retry`
      return api.http.fail(req, res, e)
    } else {
      log.error.error(`Unexpected error (${endpoint}) (user_id ${req.user.id}, body ${JSON.stringify(req.body)})\n${e}`)
      e.errorCode = shared.error.code.UNEXPECTER_ERROR
      e.message = `Could not complete request: ${e.message}`
      return api.http.fail(req, res, e)
    }
  }
}

const createActor = async (req, res, kind) => {
  const actor = await shared.db.accounts.createActor(kind)
  const session = await shared.db.accounts.createSession(actor.id)
  const token = await shared.db.accounts.tokenFromSession(session)
  return api.http.succeed(req, res, {
    actor: {id: actor.id, kind: actor.kind},
    sessionToken: token
  })
}

class Accounts {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedOutPostEndpoint("/stub_user", async (req, res) => {
      createActor(req, res, "user")
    })

    this.zoo.loggedOutPostEndpoint("/stub_bot", async (req, res) => {
      createActor(req, res, "bot")
    })

    this.zoo.loggedInPostEndpoint("/profile", async (req, res) => {
      await carefulDynamoCall("/profile", req, res, async () => {
        const profile = new shared.models.Profile(req.user.id)
        const serialized = await profile.serialize()
        return api.http.succeed(req, res, { profile: serialized } )
      })
    })
  }
}

module.exports = Accounts
