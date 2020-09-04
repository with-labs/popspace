const pg = require("./pg")

class DbAccess {
  constructor() {
  }

  now() {
    // We prefer to use timestamptz and keep everything in utc
    return moment.utc().format()
  }

  timestamptzPlusMillis(timestamptz, millis) {
    const startMoment = moment(timestamptz).utc()
    millis = parseInt(millis)
    return moment(startMoment.valueOf() + millis).utc().format()
  }

  timestamptzStillCurrent(timestamptz) {
    // null = never expire
    return !timestamptz || (moment(timestamptz).valueOf() < moment.utc().valueOf())
  }

  timestamptzHasPassed(timestamptz) {
    // null = hasn't passed
    return timestamptz && !this.timestamptzStillCurrent(timestamptz)
  }
}

module.exports = DbAccess
