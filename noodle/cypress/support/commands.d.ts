/// <reference types="cypress" />
// Define types for all our custom commands
declare namespace Cypress {
  interface Chainable {
    createRoom(): Chainable<string>;
    // currently we just have one test room.
    joinRoom(userName: string, roomUrl: string): Chainable<unknown>;
    leaveRoom(): Chainable<unknown>;
    shouldBeColor(): Chainable<unknown>;
    shouldBeSameVideoAs(): Chainable<unknown>;
    getParticipant(name: string): Chainable<Element>;
    shouldBeMakingSound(): Chainable<unknown>;
  }
}
