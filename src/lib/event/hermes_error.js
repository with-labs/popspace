class HermesError {
  constructor(errorCode, message) {
    this.errorCode = errorCode
    this.message = message
    this.name = "HermesError"
  }
}

module.exports = HermesError
