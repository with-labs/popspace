const env = {
  init: (envVars) => {
    for(const key of Object.keys(envVars)) {
      process.env[key] = envVars[key];
    }
    return env;
  },

  isDev: () => {
    return process.env.NODE_ENV == "development"
  },

  appUrl: () => {
    const protocol = env.isDev() ? "http" : "https"
    return `${protocol}://${process.env.APP_HOST}`
  }
}

module.exports = env
