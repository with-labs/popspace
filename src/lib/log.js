const log4js = require("log4js")
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
    app: { appenders: ["app", "console", "all"], level: process.env.NODE_ENV == "test" ? "info" : "info" },
    http: { appenders: ["http", "console", "all"], level: "trace" },
    dev: {
      appenders: ["console", "dev", "all"],
      level: ["development"].includes(process.env.NODE_ENV) ? "trace" : "off"
    },
    request: { appenders: ["request", "console", "all"], level: "trace" },
    response: { appenders: ["response", "console", "all"], level: "trace" },
    error: { appenders: ["error", "all"], level: "trace" }
  }
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
