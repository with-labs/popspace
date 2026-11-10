const RATE_LIMIT_SCOPE = "admin_login"

class Admin {
  constructor(zoo) {
    this.zoo = zoo
    this.initGet()
    this.initPost()
  }

  initGet() {
    this.zoo.loggedOutGetEndpoint("/auth_config", async (req, res) => {
      return api.http.succeed(req, res, { adminAuthEnabled: lib.adminAuth.isEnabled() })
    })
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/admin_login", async (req, res, params) => {
      if (!lib.adminAuth.isEnabled()) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.PERMISSION_DENIED,
          message: "Admin login is not configured"
        })
      }
      const attempt = lib.rateLimit.consume(RATE_LIMIT_SCOPE, req)
      if (!attempt.allowed) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.RATE_LIMIT_EXCEEDED,
          message: lib.rateLimit.failureMessage("Admin login locked", attempt),
          attemptsLeft: 0
        }, shared.api.http.code.TOO_MANY_REQUESTS)
      }
      if (!lib.adminAuth.checkCredentials(params.username, params.password)) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.INVALID_CREDENTIALS,
          message: lib.rateLimit.failureMessage("Invalid username or password", attempt),
          attemptsLeft: attempt.attemptsLeft
        }, shared.api.http.code.UNAUTHORIZED)
      }
      lib.rateLimit.reset(RATE_LIMIT_SCOPE, req)
      const actor = await shared.db.accounts.setAdmin(req.actor.id, true)
      const actorModel = new shared.models.Actor(actor)
      return api.http.succeed(req, res, { actor: await actorModel.serialize() })
    }, ["username", "password"])

    this.zoo.loggedInPostEndpoint("/admin_logout", async (req, res) => {
      const actor = await shared.db.accounts.setAdmin(req.actor.id, false)
      const actorModel = new shared.models.Actor(actor)
      return api.http.succeed(req, res, { actor: await actorModel.serialize() })
    })
  }
}

module.exports = Admin
