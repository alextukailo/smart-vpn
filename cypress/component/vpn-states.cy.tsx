import App from '@renderer/app/App';

import {
  createMockApi,
} from '../support/mocks/vpn-api.mock';

describe('VPN dashboard states', () => {
  it('displays an empty state', () => {
    cy.window().then((window) => {
      window.api = createMockApi([]);
    });

    cy.mount(<App />);

    cy.contains('No VPN connections found')
      .should('be.visible');
  });

  it('displays a discovery error', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.vpn.list = () => Promise.reject(
        new Error('Discovery failed'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('Unable to retrieve VPN connections.')
      .should('be.visible');
  });

  it('displays a connection operation error', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.vpn.disconnect = () => Promise.reject(
        new Error('Native operation failed'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('button', 'Disconnect VPN')
      .click();

    cy.contains('Native operation failed')
      .should('be.visible');

    cy.get('button[aria-label="Dismiss error"]')
      .click();

    cy.contains('Native operation failed')
      .should('not.exist');
  });
});
