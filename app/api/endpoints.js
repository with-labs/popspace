class Endpoints {
  constructor(express) {
    this.express = express
  }

  init() {
    const userMiddleware = [shared.api.middleware.getUser, shared.api.middleware.requireUser]
    this.express.post('/create_document', userMiddleware, async (req, res) => {
      const newDoc = await shared.db.pg.massive.unicorn.documents.insert({
        display_name: req.body.displayName,
        creator_id: req.user.id
      })
      return res.send({
        success: true,
        document: newDoc
      })
    })
  }
}

module.exports = Endpoints
