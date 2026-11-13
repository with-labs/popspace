const mediaProviders = {
  livekit: {
    endpoint: process.env.REACT_APP_LIVEKIT_ENDPOINT
  }
}

class MediaProvider {
  constructor(zoo) {
    this.zoo = zoo
    this.initGet()
  }

  initGet() {
    this.zoo.loggedOutGetEndpoint("/media_providers", async (req, res) => {
      return await api.http.succeed(req, res, { mediaProviders })
    })
  }
}

module.exports = MediaProvider
