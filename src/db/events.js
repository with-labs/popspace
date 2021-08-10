const userAgentParser = require('ua-parser-js');
const url = require('url');
const prisma = require('./prisma');

const reqToUrl = (expressRequest) => {
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

class Events {
  async actorCreateEvent(actorId, sessionId, source, expressRequest) {
    const meta = null;
    const key = 'sourced';
    return shared.db.events.recordEvent(
      actorId,
      sessionId,
      key,
      source,
      expressRequest,
      meta,
    );
  }

  async roomCreateEvent(actorId, sessionId, templateName, expressRequest) {
    const meta = null;
    const key = 'room_create';
    return shared.db.events.recordEvent(
      actorId,
      sessionId,
      key,
      templateName,
      expressRequest,
      meta,
    );
  }

  async recordEvent(
    actorId,
    sessionId,
    key,
    value,
    expressRequest = null,
    meta = null,
  ) {
    if (!expressRequest) {
      expressRequest = { headers: {}, socket: {} };
    }
    const ua = userAgentParser(
      expressRequest.headers ? expressRequest.headers['user-agent'] : '',
    );
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
  }

  eventFromRequest(
    actorId,
    sessionId,
    key,
    value,
    expressRequest,
    meta = null,
  ) {
    return {
      actorId,
      sessionId,
      key,
      value,
      meta,
      ip:
        expressRequest.headers['x-forwarded-for'] ||
        expressRequest.socket.remoteAddress,
      browser: ua.browser.name,
      device: ua.device.type,
      vendor: ua.device.vendor,
      engine: ua.engine.name,
      os: ua.os.name,
      os_version: ua.os.version,
      engine_version: ua.engine.version,
      browser_version: ua.browser.version,
      req_url: reqToUrl(expressRequest),
      user_agent: expressRequest.headers['user-agent'],
    };
  }
}

module.exports = new Events();
