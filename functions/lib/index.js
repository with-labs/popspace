// NOTE:
// It's tricky re-using code in Netlify functions.
// One way is to do a build step
// Another is to do local npm modules
// We're currently using local npm modules, so we need index.js/pckage.json files in reused code
// https://community.netlify.com/t/using-require-to-include-a-relative-module-in-netlify-functions-on-node/4177/18

require("./globals")

const lib = (global.lib = {
  util: require("./util"),
  db: require("./db"),
  email: require("./email"),
  s3: require("./s3/s3"),
  opengraph: require("./opengraph/opengraph")
})

lib.init = async (appUrl) => {
  global.gcfg = {
    appUrl: () => appUrl
  }
  // Pull this in after the env vas are loaded
  global.shared = require("@withso/with-shared")
  // order is not important, running in parallel
  await Promise.all([lib.db.init(), shared.init(), shared.initDynamo(), lib.s3.init(), lib.opengraph.init()])
}

lib.cleanup = async () => {
  await Promise.all([
    shared.cleanup(),
    lib.s3.cleanup(),
    lib.db.cleanup(),
    lib.opengraph.cleanup()
  ])
}

global.util = lib.util
global.log = lib.util.log

module.exports = lib