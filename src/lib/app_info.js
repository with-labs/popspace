const url = require("url")

const appInfo = {
  apiHost: (req) => {
    if(req) {
      const parsed = url.parse(req.url)
      return parsed.host
    } else {
      switch(process.env.NODE_ENV) {
        case 'production':
          return `hermes.noodle.so`
        case 'development':
          return `localhost`
        case 'staging':
          return `test.noodle.so`
        case 'test':
          return `localhost`
        default:
          return null
      }
    }
  },

  wssUrl: (req) => {
    return `wss://${appInfo.apiHost(req)}:${appInfo.apiPort()}`
  },

  apiUrl: (req) => {
    if(req) {
      const parsed = url.parse(req.url)
      return `${parsed.protocol}//${parsed.host}`
    } else {
      switch(process.env.NODE_ENV) {
        case 'production':
          return `https://hermes.noodle.so:${app.apiPort()}`
        case 'development':
          return `https://localhost:${app.apiPort()}`
        case 'staging':
          return `https://test.noodle.so:${app.apiPort()}`
        case 'test':
          return `https://localhost:${app.apiPort()}`
        default:
          return null
      }
    }
  },

  apiPort: () => {
    switch(process.env.NODE_ENV) {
      case 'production':
        return process.env.EXPRESS_PORT
      case 'development':
        return process.env.EXPRESS_PORT
      case 'staging':
        return process.env.EXPRESS_PORT
      case 'test':
        /*
          Separate port/name: support running a dev instance +
          running tests simultaneously
        */
        return process.env.EXPRESS_PORT_TEST
      default:
        return null
    }
  },

  isProduction: () => {
    return process.env.NODE_ENV == 'production'
  }
}

module.exports = appInfo
