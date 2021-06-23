/// <reference types="cypress" />
/// <reference path="../support/commands.d.ts" />
import { randomString } from '../util/randomString';

// A small suite of "smoke test" integration tests - designed to at least
// verify that the app can access basic functionality of joining a room and
// connecting to peers without crashing.
context('An anonymous user', () => {
  const USERNAME = randomString('user');

  describe('when joining a room, with another user already there', () => {
    const OTHER_USERNAME = randomString('user');
    let roomUrl: string;

    before(() => {
      cy.createRoom().then((url) => {
        roomUrl = url;
      });
    });

    beforeEach(() => {
      cy.joinRoom(USERNAME, roomUrl);
      cy.task('addParticipant', { name: OTHER_USERNAME, roomUrl });
    });

    afterEach(() => {
      cy.leaveRoom();
      cy.task('removeParticipant', OTHER_USERNAME);
    });

    it('should be able to see the other user', () => {
      cy.getParticipant(OTHER_USERNAME);
    });

    it('should remove the other user when they leave', () => {
      cy.task('removeParticipant', OTHER_USERNAME);
      cy.getParticipant(OTHER_USERNAME).should('not.exist');
    });
  });

  // it would be nice to test joining a fresh room with no other users, but we can't
  // currently do that in a guaranteed way, because room creation is not easy and
  // if we reuse the same room there's always a chance there are other test users inside
  // at any given time.
});
