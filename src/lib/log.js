const log4js = require("log4js")
const log4jsConfig = {
  appenders: {
    all: { type: "file", filename: "logs/all.log" },
    database: { type: "file", filename: "logs/database.log" },
    http: {type: "file", filename: "logs/http.log"},
    app: { type: "file", filename: "logs/app.log" },
    console: { type: "console" },
    dev: { type: "file", filename: "logs/dev.log" },
    received: { type: "file", filename: "logs/received.log" },
    sent: { type: "file", filename: "logs/sent.log" },
    error: { type: "file", filename: "logs/error.log" },
    system: { type: "file", filename: "logs/system.log" }
  },
  categories: {
    default: { appenders: ["console", "all"], level: "info" },
    app: { appenders: ["app", "console", "all"], level: process.env.NODE_ENV == "test" ? "error" : "info" },
    http: { appenders: ["http", "console", "all"], level: "trace" },
    system: { appenders: ["system", "all"], level: "trace" },
    database: { appenders: ["database", "all"], level: "info" },
    dev: {
      appenders: ["console", "dev", "all"],
      level: ["development"].includes(process.env.NODE_ENV) ? "trace" : "off"
    },
    received: { appenders: ["received", "all"], level: "trace" },
    sent: { appenders: ["sent", "all"], level: "trace" },
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
  database: log4js.getLogger("database"),
  app: log4js.getLogger("app"),
  http: log4js.getLogger("http"),
  system: log4js.getLogger("system"),
  dev: log4js.getLogger("dev"),
  received: log4js.getLogger("received"),
  sent: log4js.getLogger("sent"),
  error: log4js.getLogger("error"),
  all: (level, message) => {
    Object.keys(log4jsConfig.categories).map((category) => log4js.getLogger(category)[level](message))
  }
}

module.exports = logging
