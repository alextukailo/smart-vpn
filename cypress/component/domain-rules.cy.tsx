
import App from '@renderer/app/App';

import { createDefaultSettings } from '@shared/lib/settings';

import {
  createMockApi,
} from '../support/mocks/vpn-api.mock';

describe('Domain rule management', () => {
  const mountApp = (): void => {
    cy.window().then((window) => {
      window.api = createMockApi();
    });

    cy.mount(<App />);
  };

  const addDomain = (domain: string): void => {
    cy.get('input[placeholder="example.com"]')
      .should('be.enabled')
      .type(domain);

    cy.contains('button', 'Add domain')
      .should('be.enabled')
      .click();
  };

  const addExampleDomain = (): void => {
    addDomain('example.com');

    cy.contains(
      '[data-testid="domain-rule"]',
      'example.com',
    ).should('be.visible');

    cy.get('input[placeholder="example.com"]')
      .should('have.value', '');
  };

  it('displays the domain management section', () => {
    mountApp();

    cy.contains('h2', 'Domain rules')
      .should('be.visible');
  });

  it('displays an empty state', () => {
    mountApp();

    cy.contains('No domain rules yet')
      .should('be.visible');
  });

  it('adds a domain rule', () => {
    mountApp();

    addExampleDomain();

    cy.get('[data-testid="domain-rule"]')
      .should('have.length', 1);

    cy.contains('1 active rules · 1 total')
      .should('be.visible');
  });

  it('normalizes a complete URL', () => {
    mountApp();

    addDomain('https://EXAMPLE.COM/path?q=test');

    cy.get('[data-testid="domain-rule"] h3')
      .should('have.text', 'example.com');
  });

  it('rejects an invalid domain', () => {
    mountApp();

    addDomain('invalid domain');

    cy.contains('Enter a valid domain or URL')
      .should('be.visible');

    cy.get('[data-testid="domain-rule"]')
      .should('not.exist');
  });

  it('rejects duplicate domains', () => {
    mountApp();

    addExampleDomain();

    addDomain('https://example.com/path');

    cy.contains('This domain already exists')
      .should('be.visible');

    cy.get('[data-testid="domain-rule"]')
      .should('have.length', 1);
  });

  it('supports exact domain matching', () => {
    mountApp();

    cy.contains('label', 'Include subdomains')
      .find('input')
      .uncheck();

    addDomain('example.com');

    cy.contains(
      '[data-testid="domain-rule"]',
      'example.com',
    ).should('contain.text', 'Exact domain only');
  });

  it('disables a domain rule', () => {
    mountApp();

    addExampleDomain();

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('be.enabled')
      .click();

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('have.attr', 'aria-checked', 'false');

    cy.contains('0 active rules · 1 total')
      .should('be.visible');
  });

  it('enables a disabled domain rule', () => {
    mountApp();

    addExampleDomain();

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .click();

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('have.attr', 'aria-checked', 'false');

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('be.enabled')
      .click();

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('have.attr', 'aria-checked', 'true');
  });

  it('edits an existing domain rule', () => {
    mountApp();

    addExampleDomain();

    cy.get('button[aria-label="Edit example.com"]')
      .click();

    cy.get('input[placeholder="example.com"]')
      .should('have.value', 'example.com');

    cy.get('input[placeholder="example.com"]')
      .clear();

    cy.get('input[placeholder="example.com"]')
      .type('another.com');

    cy.contains('button', 'Save changes')
      .click();

    cy.get('[data-testid="domain-rule"] h3')
      .should('have.text', 'another.com');
  });

  it('cancels domain editing', () => {
    mountApp();

    addExampleDomain();

    cy.get('button[aria-label="Edit example.com"]')
      .click();

    cy.contains('button', /^Cancel$/)
      .click();

    cy.get('input[placeholder="example.com"]')
      .should('have.value', '');

    cy.get('[data-testid="domain-rule"] h3')
      .should('have.text', 'example.com');
  });

  it('removes a domain after confirmation', () => {
    mountApp();

    addExampleDomain();

    cy.get('button[aria-label="Delete example.com"]')
      .click();

    cy.contains('button', 'Confirm removal')
      .click();

    cy.get('[data-testid="domain-rule"]')
      .should('not.exist');

    cy.contains('No domain rules yet')
      .should('be.visible');
  });

  it('cancels domain removal', () => {
    mountApp();

    addExampleDomain();

    cy.get('button[aria-label="Delete example.com"]')
      .click();

    cy.contains('button', 'Keep domain')
      .click();

    cy.get('[data-testid="domain-rule"]')
      .should('have.length', 1);
  });

  it('restores previously saved domains', () => {
    cy.window().then((window) => {
      window.api = createMockApi(
        undefined,
        {
          ...createDefaultSettings(),

          domains: [
            {
              id: 'saved-domain',
              domain: 'example.com',
              enabled: false,
              includeSubdomains: false,
            },
          ],
        },
      );
    });

    cy.mount(<App />);

    cy.get('[data-testid="domain-rule"] h3')
      .should('have.text', 'example.com');

    cy.get('[role="switch"][aria-label="Enable rule for example.com"]')
      .should('have.attr', 'aria-checked', 'false');

    cy.contains('Exact domain only')
      .should('be.visible');
  });

  it('handles domain persistence errors', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.settings.addDomain = () => Promise.reject(
        new Error('Unable to save domain'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    addDomain('example.com');

    cy.contains('Unable to save domain')
      .should('be.visible');

    cy.get('[data-testid="domain-rule"]')
      .should('not.exist');

    cy.get('input[placeholder="example.com"]')
      .should('have.value', 'example.com');
  });
});
