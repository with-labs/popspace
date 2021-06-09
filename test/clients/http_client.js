const https = require('https')
const btoa = require('btoa')

class HttpClient {
  constructor(host, certificate, port) {
    super()
    this.host = host
    this.certificate = certificate
    this.port = port
  }

  async post(endpoint, data) {
    const authHeader = this.sessionToken ? `Bearer ${btoa(this.sessionToken)}` : ""
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
        res.on('error', (e) => (reject(e)))
      })
      request.write(JSON.stringify(data))
      request.end()
    })
  }

  async logIn(token) {
    this.sessionToken = token
  }
}

module.exports = HttpClient
