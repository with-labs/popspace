const moment = require("moment")

class Time {
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
    // timestamptz = A moment in the future that should
    // be ahead of the present => greater comparison
    return !timestamptz || (moment(timestamptz).valueOf() > moment.utc().valueOf())
  }

  timestamptzHasPassed(timestamptz) {
    // timestamptz = A moment in time in the past that is
    // before now => less comparison
    return timestamptz && (moment(timestamptz).valueOf() < moment.utc().valueOf())
  }

  isTimestamptzAfter(timestamptz1, timestamptz2) {
    return moment(timestamptz1).valueOf() > moment(timestamptz2).valueOf()
  }
}

module.exports = new Time()
