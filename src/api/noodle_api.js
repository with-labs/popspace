const { shared } = require("../lib/_lib")
const Zoo = require("./zoo")
const NoodleMiddleware = require("./noodle_middleware")
const http = require("./http")

const endpoints = require("./endpoints/_endpoints.js")

class NoodleApi {
  constructor(express) {
    this.zoo = new Zoo(express)
    this.middleware = new NoodleMiddleware(express)
    this.initEndpoints()
    /*
      Make sure to run this last so we can handle errors
      for all endpoints
    */
    this.zoo.setupGenericErrorHandling()
  }

  initEndpoints() {
    for(const EndpointGroup of Object.values(endpoints)) {
      new EndpointGroup(this.zoo)
    }
  }
}

module.exports = NoodleApi
