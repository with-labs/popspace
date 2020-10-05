const ids = {}
module.exports = ids

const cryptoRandomString = require('crypto-random-string');

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const LOWERCASE_AND_NUMBERS = LOWERCASE + NUMBERS
const NAME_SCHEMAS = ["ccdccdc", "ccdcdcc", "cdccdcc"]

ids.generateId = () => {
  /**
    Generates an ID using a schema of characters and digits.

    Schemas are encoded as strings; c stands for "character or number", d stands for "digit".

    We'll care to know what the chance of generating an ID that already exists.

    For example,
      dccdccd.
    How many unique IDs?

    D * N * N * D * N * N * D = D ^ 3 * N ^ 4

    Where N is number of characters, D - digits.

    So for 10 digits, 26 characters:

    10^3 * 26^4 = 2.6^4 * 10^4 ~ 45 * 10^4 = 4.5 * 10^5

    Let's allow c be digit or character

    10 ^ 3 * 36 ^ 4 = 1.67 * 10^7

    Suppose we want a 0.1% collision rate, i.e. 1/1000th previously seen.
    After which point do various schemas start having worse than 0.1% collisios?

    10^5/ 10^3 = 100 names
    10^7/ 10^3 = 10000 names
    ideally we'd want more like 100000 names

    Currently, we're using 7 symbols: 5 characters, 2 digits.
    ccdccdc
    ccdcdcc
    cdccdcc
    Note: it's unwise to mix schemas with different collision characteristics.
    E.g. if one of the combinations has 10^9, the other 10^5, the 10^5 will
    be the weakest link - since each time that schema is chosen, that's the
    collision rate of the entire algorithm.

    Each of these gives
    36 ^ 5 * 10^ 2 = 6 * 10^9

    So the total is

    1.8 * 10^10

    which means we're good through 10^10/10^3 = 10^7 IDs.

    I.e. after 10 million IDs, we'll start having too many collisions.
  */
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
