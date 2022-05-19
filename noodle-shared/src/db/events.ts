import { Request } from 'express';
import userAgentParser from 'ua-parser-js';
import url from 'url';

import prisma from './prisma';

// add socket to Request
declare module 'express' {
  interface Request {
    socket: any;
  }
}

const reqToUrl = (expressRequest: Request) => {
  if (!expressRequest.get) {
    return;
  }
  const protocol = expressRequest.protocol;
  const host = expressRequest.get('host');
  const pathname = expressRequest.originalUrl;
  if (!protocol || !host || !pathname) {
    return;
  }
  return url.format({ protocol, host, pathname });
};

export class Events {
  actorCreateEvent = (
    actorId: bigint,
    sessionId: bigint,
    source: string,
    expressRequest: Request,
  ) => {
    const meta = undefined;
    const key = 'sourced';
    return this.recordEvent(
      actorId,
      sessionId,
      key,
      source,
      expressRequest,
      meta,
    );
  };

  roomCreateEvent = (
    actorId: bigint,
    sessionId: bigint,
    templateName: string,
    expressRequest: Request,
  ) => {
    const meta = undefined;
    const key = 'room_create';
    return this.recordEvent(
      actorId,
      sessionId,
      key,
      templateName,
      expressRequest,
      meta,
    );
  };

  recordEvent = (
    actorId: bigint,
    sessionId: bigint,
    key: string,
    value: string | null,
    expressRequest: Request = null,
    meta: any = undefined,
  ) => {
    return prisma.actorEvent.create({
      data: this.eventFromRequest(
        actorId,
        sessionId,
        key,
        value,
        expressRequest,
        meta,
      ),
    });
  };

  eventFromRequest(
    actorId: bigint,
    sessionId: bigint,
    key: string,
    value: string | null,
    expressRequest: Request = null,
    meta: any = undefined,
  ) {
    if (!expressRequest) {
      expressRequest = { headers: {}, socket: {} } as any;
    }
    const ua = userAgentParser(
      expressRequest.headers ? expressRequest.headers['user-agent'] : '',
    );
    return {
      actorId,
      sessionId,
      key,
      value: value !== undefined && value !== null ? value.toString() : value,
      meta,
      ip:
        expressRequest.headers['x-forwarded-for'] ||
        expressRequest.socket.remoteAddress,
      browser: ua.browser.name,
      device: ua.device.type,
      vendor: ua.device.vendor,
      engine: ua.engine.name,
      os: ua.os.name,
      osVersion: ua.os.version,
      engineVersion: ua.engine.version,
      browserVersion: ua.browser.version,
      reqUrl: reqToUrl(expressRequest),
      userAgent: expressRequest.headers['user-agent'],
    };
  }
}

export default new Events();
