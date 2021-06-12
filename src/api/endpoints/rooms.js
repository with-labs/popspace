class Rooms {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/update_participant_state", async (req, res) => {
      await carefulDynamoCall("/update_participant_state", req, res, async () => {
        await shared.db.dynamo.room.setParticipantState(req.actor.id, req.body.participant_state)
        return http.succeed(req, res, { participantState: req.body.participant_state })
      })
    })
  }
}

module.exports = Rooms


