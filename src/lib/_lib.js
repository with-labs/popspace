const lib = {
  shared: require("@withso/noodle-shared"),
  log: require("./log.js"),
  util: require("./util.js"),
  appInfo: require("./app_info.js"),
  error: require("./error.js"),
  init: async () => {
    await lib.shared.db.pg.init()
  },
  cleanup: async () => {
    await lib.shared.db.pg.tearDown()
  },
}

module.exports = lib
