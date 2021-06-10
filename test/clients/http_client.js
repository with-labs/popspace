const https = require('https')
const btoa = require('btoa')

class HttpClient {
  constructor(host, certificate, port) {
    this.host = host
    this.certificate = certificate
    this.port = port

    /*
      Call setUser + initSession to send logged in HTTP calls
    */
    this.user = null
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

  async setUser(user) {
    this.user = user
    this.session = null
    this.token = null
  }

  async initSession() {
    if(!this.user) {
      throw "Call setUser() before calling initSession()"
    }
    this.session = await shared.db.pg.massive.sessions.findOne({
      user_id: this.user.id,
      revoked_at: null
    })
    if(!this.session) {
      this.session = await shared.test.factory.create("session", {user_id: this.user.id})
    }
    this.token = await shared.lib.auth.tokenFromSession(this.session)
    return { session: this.session, token: this.token }
  }

}

HttpClient.anyLoggedInOrCreate = async (host, certificate, port) => {
  let user = await shared.db.pg.massive.users.findOne({})
  if(!user) {
     user = await shared.test.factory.create("user")
  }
  return HttpClient.forUser(user, host, certificate, port)
}

HttpClient.forUser = async (user, host, certificate, port) => {
  const client = new HttpClient(host, certificate, port)
  await client.setUser(user)
  await client.initSession()
  return client
}

module.exports = HttpClient
