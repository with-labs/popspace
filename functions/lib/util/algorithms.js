const algorithms = {}
module.exports = algorithms

const cryptoRandomString = require('crypto-random-string');

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const LOWERCASE_AND_NUMBERS = LOWERCASE + NUMBERS
const NAME_SCHEMAS = ["cddcdcd", "ccddccd", "cdccdcc", "ccdccdc", "ccddccd"]

algorithms.generateId = () => {
  const schema = NAME_SCHEMAS[Math.floor(Math.random() * NAME_SCHEMAS.length)]
  let result = ""
  for(const char of schema) {
    switch(char) {
      case "c":
        result += cryptoRandomString({length: 1, characters: LOWERCASE_AND_NUMBERS});
        break
      case "d":
        result += cryptoRandomString({length: 1, characters: NUMBERS})
        break
    }
  }
  return result
}
