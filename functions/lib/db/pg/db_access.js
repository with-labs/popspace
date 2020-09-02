const pg = require("./pg")

class DbAccess {
  constructor() {
  }

  async init() {
    this.pg = await pg.init()
  }

  async cleanup() {
    await pg.tearDown()
    this.pg = null
  }

  now() {
    // We prefer to use timestamptz and keep everything in utc
    return moment.utc().format()
  }

  timestamptzPlusMillis(timestamptzValue, millis) {
    const startMoment = moment(timestamptzValue).utc()
    millis = parseInt(millis)
    return moment(startMoment.valueOf() + millis).utc().format()
  }

  timestamptzStillCurrent(expirationTimestamptz) {
    if(!expirationTimestamptz) {
      return true // null = never expire
    }
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  }

  timestamptzHasPassed(timestamptz) {
    return !this.timestamptzStillCurrent(expirationTimestamptz)
  }
}

module.exports = DbAccess
