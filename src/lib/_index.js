module.exports = {
  auth: require("./auth"),
  args: require("./args"),
  otp: require("./otp"),
  // I want to transition to shared.error.code vs shared.lib.errors.code,
  // but I think mercury currently references the old style
  errors: require("./errors"),
  routes: require("./routes"),
}
