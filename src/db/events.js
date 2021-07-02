const userAgentParser = require('ua-parser-js')
const url = require('url')

const reqToUrl = (expressRequest) => {
  if(!expressRequest.get) {
    return
  }
  const protocol = expressRequest.protocol
  const host = expressRequest.get('host')
  const pathname = expressRequest.originalUrl
  if(!protocol || !host || !pathname) {
    return
  }
  return url.format({ protocol, host, pathname, })
}

class Events {
  async actorCreateEvent(actorId, sessionId, source, expressRequest, tx=null) {
    const meta = null
    const key = "sourced"
    return shared.db.events.recordEvent(actorId, sessionId, key, source, expressRequest, meta, tx)
  }

  async roomCreateEvent(actorId, sessionId, templateName, expressRequest, tx=null) {
    const meta = null
    const key = "room_create"
    return shared.db.events.recordEvent(actorId, sessionId, key, templateName, expressRequest, meta, tx)
  }

  async recordEvent(actorId, sessionId, key, value, expressRequest={headers:{}, socket: {}}, meta=null, tx=null) {
    const ua = userAgentParser(expressRequest.headers['user-agent'] || "")
    const txOrMassive = tx || shared.db.pg.massive
    return txOrMassive.actor_events.insert({
      actor_id: actorId,
      session_id: sessionId,
      key: key,
      value: value,
      meta: meta,

      ip: expressRequest.headers['x-forwarded-for'] || expressRequest.socket.remoteAddress,
      browser: ua.browser.name,
      device: ua.device.type,
      vendor: ua.device.vendor,
      engine: ua.engine.name,
      os: ua.os.name,
      os_version: ua.os.version,
      engine_version: ua.engine.version,
      browser_version: ua.browser.version,
      req_url: reqToUrl(expressRequest),

      user_agent: expressRequest.headers['user-agent']
    })
  }

}

module.exports = new Events()
