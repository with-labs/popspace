class Opengraph {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/opengraph", async(req, res, params) => {
      try {
        const ogResult = await lib.opengraph.getGraphData(params.url)
        return await api.http.succeed(req, res, {result: ogResult})
      } catch (err) {
        log.error.error(`Error fetching opengraph data`)
        return await api.http.fail(req, res, { errorCode: shared.error.code.OPENGRAPH_NO_DATA })
      }
    }, ["url"])
  }
}

module.exports = Opengraph
