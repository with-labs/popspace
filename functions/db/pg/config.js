const DEV_CREDENTIALS = {
  "driver": "pg",
  "user": "withso",
  "password": "withso",
  "host": "localhost",
  "database": "withso",
  "port": "5433"
}

const PROD_CREDENTIALS = {
  "driver": "pg",
  "user": "",
  "password": "",
  "host": "",
  "database": "",
  "port": "5432",
  "ssl": true
}

module.exports = process.env.NODE_ENV == "production" ? PROD_CREDENTIALS : DEV_CREDENTIALS
