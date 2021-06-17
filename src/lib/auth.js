const moment = require("moment")

const auth = {}

class Auth {
  async actorFromToken(token) {
    const session = await this.sessionFromToken(token)
    if(!session) {
      return null
    }
    const actor = await shared.db.pg.massive.actors.findOne({
      id: session.actor_id,
      deleted_at: null
    })
    return actor
  }

  tokenFromSession(session) {
    return JSON.stringify({
      secret: session.secret
    })
  }

  async sessionFromToken(sessionToken) {
    if(!sessionToken) {
      return null
    }
    const sessionObject = JSON.parse(sessionToken)
    const session = await shared.db.pg.massive.sessions.findOne({secret: sessionObject.secret})
    if(!session || this.isExpired(session)) {
      return null
    } else {
      return session
    }
  }

  isExpired(entity) {
    if(!entity.expires_at) return false;
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  }

}

module.exports = new Auth()
