import detectSound from './detectSound';

Cypress.Commands.add('createRoom', () => {
  cy.visit('/create');
  cy.get('[data-test-id="meetingTemplate-new"]').click();
  cy.contains('Join room now').click();
  return cy.url();
});

Cypress.Commands.add('joinRoom', (username: string, roomUrl: string) => {
  cy.visit(roomUrl);
  cy.get('#displayName').type(username);
  cy.get('[type="submit"]').click();
  // wait for room to load
  cy.get('[data-test-room]');
  // wait for person bubble to appear
  cy.get(`[data-test-person="${username}"]`);
});

Cypress.Commands.add('leaveRoom', () => {
  cy.get('[data-test-id="leaveMeeting"]').click();
});

Cypress.Commands.add('shouldBeColor', { prevSubject: 'element' }, (subject, color) => {
  cy.wrap(subject)
    .find('video')
    .then(($video) => {
      cy.readFile(`cypress/fixtures/${color}.png`, 'base64').should('be.sameVideoFile', $video);
    });
});

Cypress.Commands.add('shouldBeSameVideoAs', { prevSubject: 'element' }, (subject, participant) => {
  cy.wrap(subject)
    .find('video')
    .then(($video) => cy.get(participant).find('video').should('be.sameVideoTrack', $video));
});

Cypress.Commands.add('getParticipant', (name) => cy.get(`[data-test-person="${name}"]`));

Cypress.Commands.add('shouldBeMakingSound', { prevSubject: 'element' }, (subject) => {
  const resolveValue = ($el) =>
    detectSound($el[0]).then((value) => {
      // @ts-ignore
      return cy.verifyUpcomingAssertions(
        value,
        {},
        {
          onRetry: () => resolveValue($el),
        }
      );
    });

  cy.wrap(subject).find('audio').then(resolveValue).should('equal', true);
});
