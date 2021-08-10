const https = require('https');
const btoa = require('btoa');
const prisma = require('../db/prisma');

class HttpClient {
  constructor(host, certificate, port) {
    this.host = host;
    this.certificate = certificate;
    this.port = port;

    /*
      Call logIn(actor) to send logged in HTTP calls
    */
    this.actor = null;
    this.session = null;
    this.token = null;
  }

  async post(endpoint, data) {
    const authHeader = this.token ? `Bearer ${btoa(this.token)}` : '';
    const options = {
      host: this.host,
      port: this.port,
      path: endpoint,
      method: 'POST',
      ca: this.certificate,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    };
    let responseChunks = [];
    return new Promise((resolve, reject) => {
      const request = https.request(options, (res) => {
        res.on('data', (d) => {
          responseChunks.push(d);
        });
        res.on('end', () => {
          resolve(JSON.parse(Buffer.concat(responseChunks)));
        });
        res.on('error', (e) => {
          reject(e);
        });
      });
      request.write(JSON.stringify(data));
      request.end();
    });
  }

  async forceLogIn(actor) {
    this.actor = actor;
    let session = await prisma.session.findFirst({
      where: {
        actorId: this.actor.id,
        revoked_at: null,
      },
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          actorId: actor.id,
          secret: shared.lib.otp.generate(),
        },
      });
    }
    return await this.setSession(session);
  }

  async setSession(session) {
    this.session = session;
    this.token = await shared.lib.auth.tokenFromSession(session);
    return { session: this.session, token: this.token };
  }
}

module.exports = HttpClient;
