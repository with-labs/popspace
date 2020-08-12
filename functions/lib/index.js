global.util = require("./util/index.js")
global.db = require("./db/index.js")
global.lib = {
  util: util,
  db: db
}

module.exports = lib
