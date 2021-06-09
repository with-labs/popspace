class Meetings {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost = () => {
    this.zoo.loggedInPostEndpoint("/create_meeting", async (req, res) => {
      const user = req.user
      const { template } = req.body
      const { room, roomNameEntry, roomData } = await shared.db.rooms.createRoomFromTemplate(template, user.id)
      const namedRoom = new shared.models.NamedRoom(room, roomNameEntry, roomData.state)
      //TODO: restore welcome email
      return http.succeed(req, res, { newMeeting: namedRoom.serialize() })
    })
  }
}

module.exports = Meetings
