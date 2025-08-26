// cypress/support/e2e.ts
import './commands';

// Import commands.js using ES2015 syntax:
// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log for cleaner test output
Cypress.on('window:before:load', (win) => {
  // Suppress ResizeObserver errors that don't affect functionality
  const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
  cy.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
  });
});

// Global test configurations
beforeEach(() => {
  // Set default viewport
  cy.viewport(1280, 720);
  
  // Clear local storage and session storage
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
  
  // Intercept common API calls
  cy.intercept('POST', '**/auth/v1/token**', { fixture: 'auth-response.json' }).as('login');
  cy.intercept('GET', '**/rest/v1/contacts**', { fixture: 'contacts.json' }).as('getContacts');
  cy.intercept('POST', '**/rest/v1/contacts**', { fixture: 'contact-created.json' }).as('createContact');
  cy.intercept('PATCH', '**/rest/v1/contacts/**', { fixture: 'contact-updated.json' }).as('updateContact');
  cy.intercept('DELETE', '**/rest/v1/contacts/**', {}).as('deleteContact');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // for known issues that don't affect functionality
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false;
  }
  return true;
});