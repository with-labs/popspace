const log4js = require('log4js')
const log4jsConfig = {
  appenders: {
    database: { type: 'file', filename: 'logs/database.log' },
    app: { type: 'file', filename: 'logs/app.log' },
    console: { type: 'console' },
    dev: {type: 'file', filename: 'logs/dev.log'},
    received: {type: 'file', filename: 'logs/received.log'},
    sent: {type: 'file', filename: 'logs/sent.log'},
    error: {type: 'file', filename: 'logs/error.log'}
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    app: { appenders: ['app', 'console'], level:  process.env.NODE_ENV == 'test' ? 'error' : 'info' },
    database: { appenders: ['database'], level: 'info' },
    dev: {
      appenders: ['console', 'dev'],
      level: ['developoment'].includes(process.env.NODE_ENV) ? 'trace' : 'off'
    },
    received: { appenders: ['received'], level: 'trace' },
    sent: { appenders: ['sent'], level: 'trace' },
    error: { appenders: ['error'], level: 'trace'}
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
  received: log4js.getLogger('received'),
  sent: log4js.getLogger('sent'),
  error: log4js.getLogger('error'),
  all: (level, message) => {
    Object.keys(log4jsConfig.categories).map((category) => (log4js.getLogger(category)[level](message)));
  }
}

module.exports = logging
