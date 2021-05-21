class AnalyticsProcessor {
  async process(mercuryEvent) {

    switch(mercuryEvent.kind()) {
      case "updateMicState":
        return lib.analytics.toggleVoice(mercuryEvent)
      case "updateVideoState":
        return lib.analytics.toggleVideo(mercuryEvent)
    }
  }
}

module.exports = AnalyticsProcessor
