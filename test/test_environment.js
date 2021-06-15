module.exports = class {
  constructor() {
    this.roomActorClients = []
    this.hermes = null
  }

  setHermes(hermes) {
    this.hermes = hermes
  }

  addRoomActorClient(rac) {
    this.roomActorClients.push(rac)
  }

  nthRoomClientActor(n) {
    return this.roomActorClients[n]
  }

}
