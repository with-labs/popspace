/*
  Room password rules, shared by room creation and room management.
*/
const MIN_LENGTH = 12
const MAX_LENGTH = 128

const roomPassword = {
  MIN_LENGTH,
  MAX_LENGTH,

  // an empty or missing password means a public link
  parse: (password) => {
    if (password == null || password === "") {
      return null
    }
    if (typeof password !== "string" ||
        password.length < MIN_LENGTH ||
        password.length > MAX_LENGTH) {
      const error = new Error(`Room password must be ${MIN_LENGTH}-${MAX_LENGTH} characters`)
      error.errorCode = shared.error.code.INVALID_API_PARAMS
      throw error
    }
    return password
  }
}

module.exports = roomPassword
