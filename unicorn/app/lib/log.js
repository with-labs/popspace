const log4js = require("log4js")
const log4jsConfig = {
  appenders: {
    all: { type: "file", filename: "logs/all.log" },
    app: { type: "file", filename: "logs/app.log" },
    console: { type: "console" },
    error: { type: "file", filename: "logs/error.log" },
  },
  categories: {
    default: { appenders: ["console", "all"], level: "info" },
    app: { appenders: ["app", "console", "all"], level: process.env.NODE_ENV == "test" ? "error" : "info" },
    error: { appenders: ["error", "all"], level: "trace" }
  }
}
log4js.configure(log4jsConfig)
const logging = {
  log: (domain, level, message) => {
    const logger = log4js.getLogger(domain)
    logger[level](message)
  },
  app: log4js.getLogger("app"),
  error: log4js.getLogger("error"),
  all: (level, message) => {
    Object.keys(log4jsConfig.categories).map((category) => log4js.getLogger(category)[level](message))
  }
}

module.exports = logging
