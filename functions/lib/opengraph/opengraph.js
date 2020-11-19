const opengraph = require("opengraph-io")

const OPENGRAPH_IO_APP_ID = process.env.OPENGRAPH_IO_APP_ID

class OpenGraph {
  async init() {
    this.og = opengraph({ appId: OPENGRAPH_IO_APP_ID })
  }

  async cleanup() {}

  getGraphData(url) {
    return this.og.getSiteInfo(url).then((result) => {
      // hybridGraph contains openGraph properties + inferred properties
      return result.hybridGraph
    })
  }
}

module.exports = new OpenGraph()
