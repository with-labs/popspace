class Endpoints {
  constructor(express) {
    this.express = express
  }

  init() {
    const userMiddleware = [shared.api.middleware.getActor, shared.api.middleware.requireActor]
    this.express.post('/create_document', userMiddleware, async (req, res) => {
      const newDocs = await shared.db.prisma.$queryRaw`
        INSERT INTO unicorn.documents (display_name, creator_id)
        VALUES (
          display_name = ${req.body.displayName},
          creator_id = ${req.actor.id}
        )
        RETURNING *;
      `;
      return res.send({
        success: true,
        document: newDoc
      })
    })
  }
}

module.exports = Endpoints
