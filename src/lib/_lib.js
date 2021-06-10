const shared = require("@withso/noodle-shared")

const lib = {
  shared: shared,
  log: require("./log.js"),
  util: require("./util.js"),
  appInfo: require("./app_info.js"),
  error: require("./error.js"),
  init: async () => {
    await shared.db.pg.init()
  },
  cleanup: async () => {
    await shared.db.pg.tearDown()
  },
}

if(process.env.NODE_ENV == "test") {
  lib.test = require("../../test/_test.js")
}

module.exports = lib
