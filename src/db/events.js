const userAgentParser = require('ua-parser-js')

class Events {
  actorCreateEvent(actorId, source, expressRequest, tx=null) {
    const meta = null
    const key = "sourced"
    return shared.db.events.recordEvent(actorId, key, source, expressRequest, meta, tx)
  }

  roomCreateEvent(actorId, kind, expressRequest, tx=null) {
    const meta = null
    key = "room_create"
    return shared.db.events.recordEvent(actorId, key, source, expressRequest, meta, tx)
  }

  recordEvent(actorId, key, value, expressRequest={headers:{}, socket: {}}, meta=null, tx=null) {
    const ua = userAgentParser(expressRequest.headers['user-agent'] || "")
    const txOrMassive = tx || shared.db.pg.massive
    const event = await txOrMassive.actor_events.insert({
      actor_id: actorId,
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
      user_agent: expressRequest.headers['user-agent']
    })
    return event
  }

}

module.exports = new Events()
