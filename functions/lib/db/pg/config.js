const LOCAL_CREDENTIALS = {
  "driver": "pg",
  "user": "withso",
  "password": "withso",
  "host": "localhost",
  "database": "withso",
  "port": process.env.PG_PORT || "5433"
}

const PROD_CREDENTIALS = {
  // These are run at build time, and are thus fetched from the Netlify admin panel
  "driver": "pg",
  "user": process.env.PRODUCTION_PG_USER,
  "password": process.env.PRODUCTION_PG_PASSWORD,
  "host": process.env.PRODUCTION_PG_HOST,
  "database": process.env.PRODUCTION_PG_DATABASE,
  "port": process.env.PRODUCTION_PG_PORT
}

const STAGING_CREDENTIALS = {
  "driver": "pg",
  "user": process.env.STAGING_PG_USER,
  "password": process.env.STAGING_PG_PASSWORD,
  "host": process.env.STAGING_PG_HOST,
  "database": process.env.STAGING_PG_DATABASE,
  "port": process.env.STAGING_PG_PORT,
}

const getCredentials = () => {
  switch(process.env.NODE_ENV) {
    case "production":
      return PROD_CREDENTIALS
    case "development" || "local":
      return LOCAL_CREDENTIALS
    case "preview":
      return STAGING_CREDENTIALS
    case "staging":
      return STAGING_CREDENTIALS
    case "branch-deploy":
      return STAGING_CREDENTIALS
    case "test":
      return STAGING_CREDENTIALS
    default:
      throw `unrecognized environemt ${process.env.NODE_ENV} Env: ${JSON.stringify(process.env)}`
  }
}

module.exports = getCredentials()
