const log4js = require("log4js")
const NO_TEST = process.env.NODE_ENV == "test" ? "off" : "info"
const DEV_ONLY = ["development"].includes(process.env.NODE_ENV) ? "trace" : "off"

const log4jsConfig = {
  appenders: {
    all: { type: "file", filename: `logs/${process.env.NODE_ENV}_all.log` },
    database: { type: "file", filename: `logs/${process.env.NODE_ENV}_database.log` },
    http: {type: "file", filename: `logs/${process.env.NODE_ENV}_http.log`},
    app: { type: "file", filename: `logs/${process.env.NODE_ENV}_app.log` },
    console: { type: "console" },
    dev: { type: "file", filename: `logs/${process.env.NODE_ENV}_dev.log` },
    received: { type: "file", filename: `logs/${process.env.NODE_ENV}_received.log` },
    sent: { type: "file", filename: `logs/${process.env.NODE_ENV}_sent.log` },
    error: { type: "file", filename: `logs/${process.env.NODE_ENV}_error.log` },
    system: { type: "file", filename: `logs/${process.env.NODE_ENV}_system.log` }
  },
  categories: {
    default: { appenders: ["console", "all"], level: "info" },
    app: { appenders: ["app", "console", "all"], level: NO_TEST },
    http: { appenders: ["http", "console", "all"], level: "trace" },
    system: { appenders: ["system", "all"], level: "trace" },
    database: { appenders: ["database", "all"], level: "info" },
    dev: {
      appenders: ["console", "dev", "all"],
      level: DEV_ONLY
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
