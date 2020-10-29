/// <reference types="cypress" />
// Define types for all our custom commands
declare namespace Cypress {
  interface Chainable {
    // currently we just have one test room.
    joinRoom(userName: string, roomName?: 'integrationtestroomdonotdelete', password?: string): Chainable<unknown>;
    leaveRoom(): Chainable<unknown>;
    shouldBeColor(): Chainable<unknown>;
    shouldBeSameVideoAs(): Chainable<unknown>;
    getParticipant(name: string): Chainable<Element>;
    shouldBeMakingSound(): Chainable<unknown>;
  }
}
