const log4js = require('log4js')
const log4jsConfig = {
  appenders: {
    database: { type: 'file', filename: 'logs/database.log' },
    app: { type: 'file', filename: 'logs/app.log' },
    console: { type: 'console' },
    dev: {type: 'file', filename: 'logs/dev.log'}
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    app: { appenders: ['app', 'console'], level:  process.env.NODE_ENV == 'test' ? 'error' : 'info' },
    database: { appenders: ['database'], level: 'info' },
    dev: {appenders: ['console', 'dev'], level: process.env.NODE_ENV == 'development' ? 'trace' : 'off'}
  }
}
log4js.configure(log4jsConfig)
logging = {
  log: (domain, level, message) => {
    const logger = log4js.getLogger(domain)
    logger[level](message);
  },
  default: log4js.getLogger(),
  database: log4js.getLogger('database'),
  app: log4js.getLogger('app'),
  dev: log4js.getLogger('dev'),
  all: (level, message) => {
    Object.keys(log4jsConfig.categories).map((category) => (log4js.getLogger(category)[level](message)));
  }
}

module.exports = logging
