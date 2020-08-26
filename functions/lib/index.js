// NOTE:
// It's tricky re-using code in Netlify functions.
// One way is to do a build step
// Another is to do local npm modules
// We're currently using local npm modules, so we need index.js/pckage.json files in reused code
// https://community.netlify.com/t/using-require-to-include-a-relative-module-in-netlify-functions-on-node/4177/18

require("./globals")

global.util = require("./util/index.js")
global.db = require("./db/index.js")
global.email = require("./email/index.js")

global.lib = {
  util: util,
  db: db,
  email: email
}

module.exports = lib
