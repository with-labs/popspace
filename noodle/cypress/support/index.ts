import './commands';
import './customAssertions';

cy.on('uncaught:exception', (err) => {
  console.error(err);
  return false;
});
