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
      if (lib.rateLimit.isBlocked(RATE_LIMIT_SCOPE, req)) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.RATE_LIMIT_EXCEEDED,
          message: "Too many failed attempts, try again later"
        }, shared.api.http.code.TOO_MANY_REQUESTS)
      }
      if (!lib.adminAuth.checkCredentials(params.username, params.password)) {
        lib.rateLimit.recordFailure(RATE_LIMIT_SCOPE, req)
        return api.http.fail(req, res, {
          errorCode: shared.error.code.INVALID_CREDENTIALS,
          message: "Invalid username or password"
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
