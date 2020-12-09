class MercuryError {
  constructor(errorCode, message) {
    this.errorCode = errorCode
    this.message = message
    this.name = "MercuryError"
  }
}

module.exports = MercuryError
