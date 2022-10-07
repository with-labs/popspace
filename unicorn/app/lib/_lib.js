const shared = require("@withso/noodle-shared").default
const util = require("util")


const lib = {
  init: async () => {
    util.inspect.defaultOptions.depth = 20
    util.inspect.defaultOptions.colors = true
    util.inspect.defaultOptions.getters = true
    util.inspect.defaultOptions.compact = true

    await shared.init()

    lib.db.sharedbSQLite = lib.db.SharedbSQLite({
      filename: process.env.UNICORN_DATABASE_URL.replace('file:', ''),
    });
  },
  error: require("./error.js"),
  shared: shared,
  db: require("./db/_db.js"),
  log: require("./log")
}


module.exports = lib
