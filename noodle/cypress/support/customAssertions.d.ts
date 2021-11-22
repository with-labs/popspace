/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainer<Subject> {
    (chainer: 'be.sameVideoTrack'): Chainable<Subject>;
    (chainer: 'not.be.sameVideoTrack'): Chainable<Subject>;
    (chainer: 'be.sameVideoFile'): Chainable<Subject>;
    (chainer: 'not.be.sameVideoFile'): Chainable<Subject>;
  }
}
