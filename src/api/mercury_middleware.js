const bodyParser = require("body-parser")
const cors = require("cors")
const base64Decode = (str) => Buffer.from(str, "base64").toString("utf-8")
const getUser = async (req, res) => {
  // support Authorization header with a bearer token,
  // fallback to a `token` field on a POST body
  const authHeader = req.headers.authorization || req.headers.Authorization
  const token = authHeader && authHeader.startsWith("Bearer")
      ? base64Decode(authHeader.replace("Bearer ", ""))
      : null
  if (!token) {
    return false
  }
  const session = await shared.db.accounts.sessionFromToken(token)
  if (!session) {
    return false
  }
  const userId = parseInt(session.user_id)
  const user = await shared.db.accounts.userById(userId)
  if (!user) {
    return false
  }
  req.user = user
  req.session = session
  return false
}

const getAppUrl = async (req, res) => {
  req.mercury = {
    webUrl: lib.app.webUrl(req),
    apiUrl: lib.app.apiUrl(req),
  }
}

class MercuryMiddleware {
  constructor(express) {
    this.express = express
    this.express.use(cors())
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use((req, res, next) => {
      req.body = lib.util.camelToSnakeCase(req.body)
      next()
    })
    this.handlers = []
  }

  initLoggedInPost() {
    this.addMiddleware(getAppUrl)
    this.addMiddleware(getUser)
  }

  addMiddleware(handler) {
    /*
      Sidestepping express.use():
      I'm not sure I want these to run
      e.g. when the socket connections are negotiated.
      I don't think there's any performance difference.
      Perhaps we can have a separate express instance for the API -
      but then I'd have to run it on a different port.
      Which may not be bad.
    **/
    this.handlers.push(handler)
  }

  async run(req, res) {
    for(let i = 0; i < this.handlers.length; i++) {
      const stop = await this.handlers[i](req, res)
      if(stop) {
        return
      }
    }
  }
}

module.exports = MercuryMiddleware
