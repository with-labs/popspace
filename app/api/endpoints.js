class Endpoints {
  constructor(express) {
    this.express = express
  }

  init() {
    const userMiddleware = [shared.api.middleware.getUser, shared.api.middleware.requireUser]
    this.express.post('/create_document', userMiddleware, async (req, res) => {
      const newDocs = await shared.db.prisma.$queryRaw`
        INSERT INTO unicorn.documents (display_name, creator_id)
        VALUES (
          display_name = ${req.body.displayName},
          creator_id = ${req.user.id}
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
