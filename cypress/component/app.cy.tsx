
import App from '@renderer/app/App';

import {
  createMockApi,
} from '../support/mocks/vpn-api.mock';

describe('Smart VPN dashboard', () => {
  beforeEach(() => {
    cy.window().then((window) => {
      window.api = createMockApi();
    });

    cy.mount(<App />);
  });

  it('renders the application heading', () => {
    cy.get('h1')
      .should('be.visible')
      .and('have.text', 'Smart VPN');
  });

  it('renders the application slogan', () => {
    cy.contains('Your connection. Your rules.')
      .should('be.visible');
  });

  it('displays system information', () => {
    cy.contains('macOS · ARM64')
      .should('be.visible');
  });

  it('displays the application version', () => {
    cy.contains('v1.0.0')
      .should('be.visible');
  });

  it('displays all available connections', () => {
    cy.get('[data-testid="vpn-connection"]')
      .should('have.length', 4);
  });

  it('displays the active VPN connection', () => {
    cy.contains('h2', 'Urban VPN Desktop')
      .should('be.visible');
  });

  it('disables connecting another VPN while one is active', () => {
    cy.contains(
      '[data-testid="vpn-connection"]',
      'Hetzner VPN',
    ).within(() => {
      cy.contains('button', 'Connect')
        .should('be.disabled');
    });
  });

  it('disconnects the active VPN', () => {
    cy.contains('button', 'Disconnect VPN')
      .click();

    cy.contains('h2', 'Not connected')
      .should('be.visible');
  });

  it('connects another VPN after disconnecting the active VPN', () => {
    cy.contains('button', 'Disconnect VPN')
      .click();

    cy.contains(
      '[data-testid="vpn-connection"]',
      'Hetzner VPN',
    ).within(() => {
      cy.contains('button', 'Connect')
        .should('be.enabled')
        .click();
    });

    cy.contains('h2', 'Hetzner VPN')
      .should('be.visible');
  });

  it('uses the yellow brand accent', () => {
    cy.get('[data-testid="brand-icon"]')
      .should(
        'have.css',
        'background-color',
        'rgb(255, 212, 67)',
      );
  });
});
