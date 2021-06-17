module.exports = class {
  constructor() {
    this.roomActorClients = []
    this.hermes = null
    this.host = null
  }

  setHost(roomActorClient) {
    this.host = roomActorClient
  }

  setHermes(hermes) {
    this.hermes = hermes
  }

  addRoomActorClients(...racs) {
    this.roomActorClients.push(...racs)
  }

  async createRoomActorClient() {
    const roomActorClient = await lib.test.models.RoomActorClient.create(this.getHostRoom())
    await roomActorClient.join()
    return roomActorClient
  }

  forEachParticipant(lambda) {
    return this.roomActorClients.forEach(lambda)
  }

  allRoomActorClients() {
    return this.roomActorClients
  }

  allExceptHost() {
    return this.roomActorClients.filter((lu) => (
      lu != this.host
    ))
  }

  nthRoomClientActor(n) {
    return this.roomActorClients[n]
  }

  getHost() {
    return this.host
  }

  getHostRoom() {
    if(this.host) {
      return this.host.room
    }
    return null
  }

}
