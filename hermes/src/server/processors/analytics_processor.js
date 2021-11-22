class AnalyticsProcessor {
  async process(hermesEvent) {

    switch(hermesEvent.kind()) {
      case "updateMicState":
        return lib.analytics.toggleVoice(hermesEvent)
      case "updateVideoState":
        return lib.analytics.toggleVideo(hermesEvent)
    }
  }
}

module.exports = AnalyticsProcessor
