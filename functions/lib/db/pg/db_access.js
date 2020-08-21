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
}

module.exports = DbAccess
