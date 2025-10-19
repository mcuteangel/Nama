// cypress/support/commands.ts
/// <reference types="cypress" />
/// <reference types="cypress-axe" />

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test credentials
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): void;
      
      /**
       * Custom command to create a test contact
       * @example cy.createContact({ firstName: 'John', lastName: 'Doe' })
       */
      createContact(contactData: Partial<Contact>): void;
      
      /**
       * Custom command to wait for the app to be ready
       * @example cy.waitForApp()
       */
      waitForApp(): void;
      
      /**
       * Custom command to switch language
       * @example cy.switchLanguage('fa')
       */
      switchLanguage(language: 'en' | 'fa'): void;
    }
  }
}

interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  group?: string;
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.wait('@login' as any);
  cy.url().should('not.include', '/login');
  cy.get('[data-testid="user-menu"]').should('be.visible');
});

// Create contact command
Cypress.Commands.add('createContact', (contactData: Partial<Contact>) => {
  cy.visit('/add-contact');
  cy.waitForApp();
  
  if (contactData.firstName) {
    cy.get('[data-testid="first-name-input"]').type(contactData.firstName);
  }
  
  if (contactData.lastName) {
    cy.get('[data-testid="last-name-input"]').type(contactData.lastName);
  }
  
  if (contactData.phoneNumber) {
    cy.get('[data-testid="phone-number-input"]').first().type(contactData.phoneNumber);
  }
  
  if (contactData.email) {
    cy.get('[data-testid="email-input"]').first().type(contactData.email);
  }
  
  if (contactData.group) {
    cy.get('[data-testid="group-select"]').click();
    cy.get(`[data-testid="group-option-${contactData.group}"]`).click();
  }
  
  cy.get('[data-testid="save-contact-button"]').click();
  cy.wait('@createContact' as any);
});

// Wait for app to be ready
Cypress.Commands.add('waitForApp', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.get('main').should('be.visible');
});

// Accessibility check command
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  });
});

// Language switching command
Cypress.Commands.add('switchLanguage', (language: 'en' | 'fa') => {
  cy.get('[data-testid="language-selector"]').click();
  cy.get(`[data-testid="language-option-${language}"]`).click();
  cy.get('html').should('have.attr', 'dir', language === 'fa' ? 'rtl' : 'ltr');
});