const https = require('https');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'btoa'.
const btoa = require('btoa');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisma'.
const prisma = require('../db/prisma');

class HttpClient {
  actor: any;
  certificate: any;
  host: any;
  port: any;
  session: any;
  token: any;
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
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Buffer' is not assignable to par... Remove this comment to see the full error message
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
        revokedAt: null,
      },
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          actorId: actor.id,
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
          secret: shared.lib.otp.generate(),
        },
      });
    }
    return await this.setSession(session);
  }

  async setSession(session) {
    this.session = session;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    this.token = await shared.lib.auth.tokenFromSession(session);
    return { session: this.session, token: this.token };
  }
}

module.exports = HttpClient;
