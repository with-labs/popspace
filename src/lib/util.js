const camelcaseKeys = require('camelcase-keys')
const snakecaseKeys = require('snakecase-keys')

/* The JSON API is camelcase, but the database has underscore column names */
const CAMELCASE_DEEP = { deep: true }

const util = {
  snakeToCamelCase: (snakeCase) => {
    return camelcaseKeys(snakeCase, CAMELCASE_DEEP)
  },

  camelToSnakeCase: (camelCase) => {
    return snakecaseKeys(camelCase)
  }
}

module.exports = util
