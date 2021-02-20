const url = require("url")

const appInfo = {
  webUrl: (req) => {

    if(req) {
      /*
        Currently only the web app will make requests.
        Perhaps we'll want to get more specific with various use
        cases later.
      */
      const parsed = url.parse(req.originalUrl)
      return `${parsed.protocol}//${parsed.host}`
    } else {
      switch(process.env.NODE_ENV) {
        case 'production':
          return 'https://app.with.so'
        case 'development':
          return 'http://localhost:8888'
        case 'staging':
          return 'https://staging.app.with.so'
        case 'test':
          // just use a running instance for now
          // maybe later we can spin up a web server for tests
          return 'http://localhost:8888'
        default:
          return null
      }
    }

  },

  apiHost: (req) => {
    if(req) {
      const parsed = url.parse(req.url)
      return parsed.host
    } else {
      switch(process.env.NODE_ENV) {
        case 'production':
          return `mercury.with.so`
        case 'development':
          return `localhost`
        case 'staging':
          return `test.with.so`
        case 'test':
          return `localhost`
        default:
          return null
      }
    }
  },

  apiUrl: (req) => {
    if(req) {
      const parsed = url.parse(req.url)
      return `${parsed.protocol}//${parsed.host}`
    } else {
      switch(process.env.NODE_ENV) {
        case 'production':
          return `https://mercury.with.so:${app.apiPort()}`
        case 'development':
          return `https://localhost:${app.apiPort()}`
        case 'staging':
          return `https://test.with.so:${app.apiPort()}`
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
        return 8443
      case 'development':
        return process.env.EXPRESS_PORT
      case 'staging':
        return 8443
      case 'test':
        return process.env.TEST_PORT
      default:
        return null
    }
  },

  isProduction: () => {
    return process.env.NODE_ENV == 'production'
  }
}

module.exports = appInfo
