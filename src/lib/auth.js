const moment = require("moment")

const auth = {}

class Auth {
  async userFromToken(token) {
    const session = await this.sessionFromToken(token)
    if(!session) {
      return null
    }
    const userId = parseInt(session.user_id)
    const user = await shared.db.pg.massive.users.findOne({id: userId, deleted_at: null})
    return user
  }

  tokenFromSession(session) {
    return JSON.stringify({
      secret: session.secret,
      uid: session.user_id
    })
  }

  async sessionFromToken(sessionToken) {
    if(!sessionToken) {
      return null
    }
    const sessionObject = JSON.parse(sessionToken)
    const session = await shared.db.pg.massive.sessions.findOne({user_id: sessionObject.uid, secret: sessionObject.secret})
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
