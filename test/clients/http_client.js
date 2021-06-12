const https = require('https')
const btoa = require('btoa')

class HttpClient {
  constructor(host, certificate, port) {
    this.host = host
    this.certificate = certificate
    this.port = port

    /*
      Call setActor + initSession to send logged in HTTP calls
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
      /*
        TODO: This shouldn't be necessary with mkcert certificates.
        However, I have not yet been able to get this to work
        w/o it - even with the certificate explicitly passed in
        below. It should work, I must be missing something
        https://dev.to/tingwei628/using-mkcert-in-node-js-ijm
      */
      rejectUnauthorized: lib.appInfo.isProduction(),
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

  async setActor(actor) {
    this.actor = actor
    this.session = null
    this.token = null
  }

  async initSession() {
    if(!this.actor) {
      throw "Call setActor() before calling initSession()"
    }
    this.session = await shared.db.pg.massive.sessions.findOne({
      actor_id: this.actor.id,
      revoked_at: null
    })
    if(!this.session) {
      this.session = await shared.test.factory.create("session", {actor_id: this.actor.id})
    }
    this.token = await shared.lib.auth.tokenFromSession(this.session)
    return { session: this.session, token: this.token }
  }

}

HttpClient.anyLoggedInOrCreate = async (host, certificate, port) => {
  let actor = await shared.db.pg.massive.actors.findOne({})
  return HttpClient.create(host, certificate, port)
}

HttpClient.create = async (host, certificate, port) => {
  const actor = await shared.test.factory.create("actor")
  return HttpClient.forActor(actor, host, certificate, port)
}

HttpClient.forActor = async (actor, host, certificate, port) => {
  const client = new HttpClient(host, certificate, port)
  await client.setActor(actor)
  await client.initSession()
  return client
}

module.exports = HttpClient
