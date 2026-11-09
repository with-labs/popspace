const camelcaseKeys = require('camelcase-keys')
const snakecaseKeys = require('snakecase-keys')

/* The JSON API is camelcase, but the database has underscore column names */
const CAMELCASE_DEEP = { deep: true }

const REDACTED_KEYS = ['password']

const util = {
  // strips secrets from request bodies before they are logged
  redact: (body) => {
    if (!body || typeof body !== 'object') {
      return body
    }
    const result = { ...body }
    for (const key of REDACTED_KEYS) {
      if (key in result) {
        result[key] = '[redacted]'
      }
    }
    return result
  },

  snakeToCamelCase: (snakeCase) => {
    return camelcaseKeys(snakeCase, CAMELCASE_DEEP)
  },

  camelToSnakeCase: (camelCase) => {
    return snakecaseKeys(camelCase)
  }
}

module.exports = util
