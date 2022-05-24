const mediaProviders = {};

if (process.env.LIVEKIT_API_KEY) {
  mediaProviders.livekit = {
    endpoint: process.env.REACT_APP_LIVEKIT_ENDPOINT
  }
} else if (process.env.TWILIO_ACCOUNT_SID) {
  mediaProviders.twilio = {};
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
