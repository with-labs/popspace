const { shared } = require("../lib/_lib")
const Api = require("./api")
const http = require("./http")

class HermesApi {
  constructor(server) {
    this.server = server
    this.api = new Api(server.getExpress())
    this.initPostRoutes()
    /*
      Make sure to run this last so we can handle errors
      for all endpoints
    */
    this.api.setupGenericErrorHandling()
  }

  initPostRoutes() {
    /*
      For the time being, our HTTP capabilities are limited.

      Anything that wants to send a message on a socket to a user
      needs to go through the server that holds that socket.

      Thus, if our HTTP call needs to notify socket users,
      that call has to go through the socket server.

      If we had a way to route messages to the right socket server,
      we could have a standalone HTTP service that routes messages
      to hermes - in fact, to the correct hermes, that holds the socket
      of the recipient.

      Meantime, the only solution is to send those HTTP requests
      directly to hermes.
    */
  }
}

module.exports = HermesApi
