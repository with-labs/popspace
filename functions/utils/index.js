// NOTE:
// It's tricky re-using code in Netlify functions.
// One way is to do a build step
// Another is to do local npm modules
// We're currently using local npm modules, so we need index.js/pckage.json files in reused code
// https://community.netlify.com/t/using-require-to-include-a-relative-module-in-netlify-functions-on-node/4177/18

module.exports = {
  http: require("./http"),
  session: require("./session"),
  env: require("./env")
}
