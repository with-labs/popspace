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
  },

  removeFromArray: (array, value) => {
    const index = array.indexOf(value)
    if(index > 0) {
      array.splice(index, 1)
    }
    return array
  }
}

module.exports = util
