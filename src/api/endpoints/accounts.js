const createActor = async (req, res, kind) => {
  const pgActor = await shared.db.accounts.createActor(kind)
  const session = await shared.db.accounts.createSession(pgActor.id)
  const token = await shared.db.accounts.tokenFromSession(session)
  const actor = new shared.models.Actor(pgActor)
  return api.http.succeed(req, res, {
    actor: (await actor.serialize()),
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

    this.zoo.loggedOutPostEndpoint("/stub_slack", async (req, res) => {
      createActor(req, res, "slack")
    })

    this.zoo.loggedOutPostEndpoint("/stub_gcal", async (req, res) => {
      createActor(req, res, "gcal")
    })

    this.zoo.loggedInPostEndpoint("/subscribe_to_newsletter", async (req, res) => {
      await shared.db.accounts.newsletterSubscribe(req.actor.id)
      return await http.succeed(req, res, {})
    })

    this.zoo.loggedInPostEndpoint("/unsubscribe_from_newsletter", async (req, res) => {
      await shared.db.accounts.newsletterUnsubscribe(req.actor.id)
      return await http.succeed(req, res, {})
    })

    this.zoo.loggedOutPostEndpoint("/magic_link_subscribe", async (req, res) => {
      const magicLinkId = req.body.magic_link_id
      const otp = req.body.otp
      const request = await shared.db.magic.magicLinkById(magicLinkId)
      const result = await shared.db.magic.tryToSubscribe(request, otp)
      if (result.error) {
        return await http.authFail(req, res, result.error)
      }
      return await http.succeed(req, res, {})
    })

    this.zoo.loggedOutPostEndpoint("/magic_link_unsubscribe", async (req, res) => {
      const magicLinkId = req.body.magic_link_id
      const otp = req.body.otp
      const request = await shared.db.magic.magicLinkById(magicLinkId)
      const result = await shared.db.magic.tryToUnsubscribe(request, otp)
      if (result.error) {
        return await http.authFail(req, res, result.error)
      }
      return await http.succeed(req, res, {})
    })

    this.zoo.loggedInGetEndpoint("/actor", async (req, res) => {
      const actorModel = new shared.models.Actor(req.actor)
      return api.http.succeed(req, res, { actor: await actorModel.serialize() })
    })

    this.zoo.loggedInPostEndpoint("/profile", async (req, res) => {
      const profile = new shared.models.Profile(req.actor.id)
      const serialized = await profile.serialize()
      return api.http.succeed(req, res, { profile: serialized } )
    })
  }
}

module.exports = Accounts
