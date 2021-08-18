import * as https from 'https';

import prisma from '../db/prisma';
import auth from '../lib/auth';
import otplib from '../lib/otp';

const base64Decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

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
    const authHeader = this.token ? `Bearer ${base64Decode(this.token)}` : '';
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
          secret: otplib.generate(),
        },
      });
    }
    return await this.setSession(session);
  }

  async setSession(session) {
    this.session = session;
    this.token = await auth.tokenFromSession(session);
    return { session: this.session, token: this.token };
  }
}

export default HttpClient;
