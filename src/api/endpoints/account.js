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
      return http.fail(req, res, e)
    } else {
      log.error.error(`Unexpected error (${endpoint}) (user_id ${req.user.id}, body ${JSON.stringify(req.body)})\n${e}`)
      e.errorCode = shared.error.code.UNEXPECTER_ERROR
      e.message = `Could not complete request: ${e.message}`
      return http.fail(req, res, e)
    }
  }
}

class Account {
  constructor(zoo) {
    this.zoo = zoo
    initPost()
  }

  initPost()
  {
    this.zoo.loggedOutPostEndpoint("/stub_user", async (req, res) => {
      const user = await shared.db.accounts.createUser()
      const session = await shared.db.accounts.createSession(user.id)
      const token = await shared.db.accounts.tokenFromSession(session)
      return http.succeed(req, res, {
        user: {id: user.id},
        sessionToken: token
      })
    })

    this.zoo.loggedInPostEndpoint("/profile", async (req, res) => {
      await carefulDynamoCall("/profile", req, res, async () => {
        const profile = new shared.models.Profile(req.user.id)
        const serialized = await profile.serialize()
        return http.succeed(req, res, { profile: serialized } )
      })
    })
  }
}

module.exports = Account
