const log4js = require("log4js")

const NO_TEST = process.env.NODE_ENV == "test" ? "off" : "info"
const DEV_ONLY = ["development"].includes(process.env.NODE_ENV) ? "trace" : "off"

const log4jsConfig = {
  appenders: {
    all: { type: "file", filename: "logs/all.log" },
    http: {type: "file", filename: "logs/http.log"},
    app: { type: "file", filename: "logs/app.log" },
    console: { type: "console" },
    dev: { type: "file", filename: "logs/dev.log" },
    request: { type: "file", filename: "logs/request.log" },
    response: { type: "file", filename: "logs/response.log" },
    error: { type: "file", filename: "logs/error.log" },
  },
  categories: {
    default: { appenders: ["console", "all"], level: "info" },
    app: { appenders: ["app", "console", "all"], level: NO_TEST },
    http: { appenders: ["http", "console", "all"], level: "trace" },
    dev: {
      appenders: ["console", "dev", "all"],
      level: DEV_ONLY
    },
    request: { appenders: ["request", "console", "all"], level: NO_TEST },
    response: { appenders: ["response", "console", "all"], level: NO_TEST },
    error: { appenders: ["error", "all"], level: "trace" }
  },
  pm2: true
  /*
    Some folks suggest using {disableClustering: true} to get log4js working with pm2
    https://www.gitmemory.com/issue/log4js-node/log4js-node/265/544974438

    Others suggest using the pm2-intercom package, which hasn't been updated in 6 years...
    https://github.com/log4js-node/log4js-node/blob/master/docs/clustering.md

    Here's a discussion around it
    https://github.com/log4js-node/log4js-node/issues/265
    particularly this
    https://github.com/log4js-node/log4js-node/issues/265#issuecomment-331090803

    However, using raw pm2-intercom results in an error:
    ```
      4|pm2-intercom  | Error: ID, DATA or TOPIC field is missing
    ```
    This appears to be because of the
    ```
      process.send('ready')
    ```
    Message we send at the start of the process
    (https://pm2.keymetrics.io/docs/usage/signals-clean-restart/)

    Someone has graciously forked pm2-intercom just for this
    https://www.npmjs.com/package/pm2-graceful-intercom

    so we want to do
    pm2 install pm2-graceful-intercom

    NOTE: pm2 install pm2-graceful-intercom, NOT npm install pm2-graceful-intercom
  */
}
log4js.configure(log4jsConfig)
const logging = {
  log: (domain, level, message) => {
    const logger = log4js.getLogger(domain)
    logger[level](message)
  },
  default: log4js.getLogger(),
  app: log4js.getLogger("app"),
  http: log4js.getLogger("http"),
  dev: log4js.getLogger("dev"),
  request: log4js.getLogger("request"),
  response: log4js.getLogger("response"),
  error: log4js.getLogger("error"),
  all: (level, message) => {
    Object.keys(log4jsConfig.categories).map((category) => log4js.getLogger(category)[level](message))
  }
}

module.exports = logging
