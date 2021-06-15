const https = require('https')
const btoa = require('btoa')

class HttpClient {
  constructor(host, certificate, port) {
    this.host = host
    this.certificate = certificate
    this.port = port

    /*
      Call logIn(actor) to send logged in HTTP calls
    */
    this.actor = null
    this.session = null
    this.token = null
  }

  async post(endpoint, data) {
    const authHeader = this.token ? `Bearer ${btoa(this.token)}` : ""
    const options = {
      host: this.host,
      port: this.port,
      path: endpoint,
      method: 'POST',
      ca: this.certificate,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
    }
    let responseChunks = []
    return new Promise((resolve, reject) => {
      const request = https.request(options, (res) => {
        res.on('data', (d) => {
          responseChunks.push(d)
        })
        res.on('end', () => {
          resolve(JSON.parse(Buffer.concat(responseChunks)))
        })
        res.on('error', (e) => {
          reject(e)
        })
      })
      request.write(JSON.stringify(data))
      request.end()
    })
  }

  async logIn(actor) {
    this.actor = actor
    this.session = await shared.db.pg.massive.sessions.findOne({
      actor_id: this.actor.id,
      revoked_at: null
    })

    if(!this.session) {
      this.session = await shared.db.pg.massive.sessions.insert({
        actor_id: actor.id,
        secret: shared.lib.otp.generate()
      })
    }
    this.token = await shared.lib.auth.tokenFromSession(this.session)
    return { session: this.session, token: this.token }
  }
}

module.exports = HttpClient
