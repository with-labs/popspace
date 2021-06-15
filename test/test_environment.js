module.exports = class {
  constructor() {
    this.roomActorClients = []
    this.hermes = null
  }

  setHermes(hermes) {
    this.hermes = hermes
  }

  addRoomActorClients(...racs) {
    this.roomActorClients.push(...racs)
  }

  forEachParticipant(lambda) {
    return this.roomActorClients.forEach(lambda)
  }

  allRoomActorClients() {
    return this.roomActorClients
  }

  nthRoomClientActor(n) {
    return this.roomActorClients[n]
  }

}
