describe('Contact Management E2E Tests', () => {
  beforeEach(() => {
    // Mock authentication and setup test data
    cy.intercept('GET', '**/auth/v1/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('GET', '**/rest/v1/contacts**', { fixture: 'contacts.json' }).as('getContacts');
    cy.intercept('GET', '**/rest/v1/groups**', { fixture: 'groups.json' }).as('getGroups');
  });

  describe('Authentication Flow', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.login('test@example.com', 'password123');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('invalid@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });
  });

  describe('Contact CRUD Operations', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should create a new contact successfully', () => {
      cy.createContact({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        email: 'john.doe@example.com',
        group: 'Family'
      });
      
      cy.get('[data-testid="success-toast"]').should('contain', 'Contact created successfully');
      cy.url().should('include', '/contacts');
    });

    it('should display contact list', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      cy.wait('@getContacts');
      
      cy.get('[data-testid="contact-list"]').should('be.visible');
      cy.get('[data-testid="contact-item"]').should('have.length.at.least', 1);
    });

    it('should search contacts', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('[data-testid="search-input"]').type('John');
      cy.get('[data-testid="contact-item"]')
        .should('contain', 'John')
        .and('have.length.at.most', 3);
    });

    it('should view contact details', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('[data-testid="contact-item"]').first().click();
      cy.url().should('match', /\/contacts\/[a-zA-Z0-9-]+$/);
      cy.get('[data-testid="contact-detail"]').should('be.visible');
      cy.get('[data-testid="contact-name"]').should('not.be.empty');
    });

    it('should edit contact', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('[data-testid="contact-item"]').first().click();
      cy.get('[data-testid="edit-contact-button"]').click();
      
      cy.url().should('match', /\/contacts\/edit\/[a-zA-Z0-9-]+$/);
      cy.get('[data-testid="first-name-input"]').clear().type('Updated John');
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.wait('@updateContact');
      cy.get('[data-testid="success-toast"]').should('contain', 'Contact updated successfully');
    });

    it('should delete contact', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('[data-testid="contact-item"]').first().click();
      cy.get('[data-testid="delete-contact-button"]').click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.wait('@deleteContact');
      cy.get('[data-testid="success-toast"]').should('contain', 'Contact deleted successfully');
      cy.url().should('include', '/contacts');
    });
  });

  describe('AI Contact Extraction', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
      cy.intercept('POST', '**/functions/v1/extract-contact-info', { fixture: 'ai-extraction.json' }).as('extractContact');
    });

    it('should extract contact from text', () => {
      cy.visit('/add-contact');
      cy.waitForApp();
      
      const contactText = 'John Smith, phone: 555-123-4567, email: john.smith@example.com, works at TechCorp';
      
      cy.get('[data-testid="ai-text-input"]').type(contactText);
      cy.get('[data-testid="extract-button"]').click();
      
      cy.wait('@extractContact');
      cy.get('[data-testid="ai-suggestion-card"]').should('be.visible');
      cy.get('[data-testid="suggested-name"]').should('contain', 'John Smith');
      cy.get('[data-testid="suggested-phone"]').should('contain', '555-123-4567');
      cy.get('[data-testid="suggested-email"]').should('contain', 'john.smith@example.com');
    });

    it('should apply AI suggestions to form', () => {
      cy.visit('/add-contact');
      cy.waitForApp();
      
      cy.get('[data-testid="ai-text-input"]').type('Jane Doe, mobile: 555-987-6543');
      cy.get('[data-testid="extract-button"]').click();
      
      cy.wait('@extractContact');
      cy.get('[data-testid="apply-suggestions-button"]').click();
      
      cy.get('[data-testid="first-name-input"]').should('have.value', 'Jane');
      cy.get('[data-testid="last-name-input"]').should('have.value', 'Doe');
      cy.get('[data-testid="phone-number-input"]').first().should('have.value', '555-987-6543');
    });
  });

  describe('Group Management', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should create a new group', () => {
      cy.visit('/groups');
      cy.waitForApp();
      
      cy.get('[data-testid="add-group-button"]').click();
      cy.get('[data-testid="group-name-input"]').type('Work Colleagues');
      cy.get('[data-testid="group-color-picker"]').click();
      cy.get('[data-testid="color-option-blue"]').click();
      cy.get('[data-testid="save-group-button"]').click();
      
      cy.get('[data-testid="success-toast"]').should('contain', 'Group created successfully');
      cy.get('[data-testid="group-list"]').should('contain', 'Work Colleagues');
    });

    it('should assign contact to group', () => {
      cy.createContact({
        firstName: 'Alice',
        lastName: 'Johnson',
        group: 'Work'
      });
      
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('[data-testid="contact-item"]')
        .contains('Alice Johnson')
        .should('contain', 'Work');
    });
  });

  describe('Internationalization', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should switch to Persian language', () => {
      cy.visit('/settings');
      cy.waitForApp();
      
      cy.switchLanguage('fa');
      
      // Check that Persian text is displayed
      cy.get('[data-testid="page-title"]').should('contain', 'تنظیمات');
      cy.get('html').should('have.attr', 'dir', 'rtl');
    });

    it('should maintain language preference across sessions', () => {
      cy.visit('/settings');
      cy.switchLanguage('fa');
      
      // Reload page
      cy.reload();
      cy.waitForApp();
      
      cy.get('html').should('have.attr', 'dir', 'rtl');
      cy.get('[data-testid="page-title"]').should('contain', 'تنظیمات');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should display mobile navigation on small screens', () => {
      cy.viewport('iphone-8');
      cy.visit('/');
      
      cy.get('[data-testid="mobile-header"]').should('be.visible');
      cy.get('[data-testid="bottom-navigation"]').should('be.visible');
      cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
    });

    it('should show desktop sidebar on large screens', () => {
      cy.viewport(1280, 720);
      cy.visit('/');
      
      cy.get('[data-testid="desktop-sidebar"]').should('be.visible');
      cy.get('[data-testid="mobile-header"]').should('not.be.visible');
      cy.get('[data-testid="bottom-navigation"]').should('not.be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should be accessible on home page', () => {
      cy.visit('/');
      cy.waitForApp();
      cy.checkA11y();
    });

    it('should be accessible on contacts page', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      cy.checkA11y();
    });

    it('should be accessible on add contact form', () => {
      cy.visit('/add-contact');
      cy.waitForApp();
      cy.checkA11y();
    });

    it('should support keyboard navigation', () => {
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'add-contact-button');
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should load pages within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.visit('/contacts');
      cy.waitForApp();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('should handle large contact lists efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '**/rest/v1/contacts**', { fixture: 'large-contacts.json' }).as('getLargeContacts');
      
      cy.visit('/contacts');
      cy.wait('@getLargeContacts');
      cy.waitForApp();
      
      // Check that virtual scrolling is working
      cy.get('[data-testid="virtualized-list"]').should('be.visible');
      cy.get('[data-testid="contact-item"]').should('have.length.lessThan', 50); // Only visible items rendered
    });
  });
});