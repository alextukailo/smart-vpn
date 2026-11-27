
import App from '@renderer/app/App';

import { type VpnConnection } from '@shared/types';

import {
  createDefaultSettings,
} from '@shared/lib/settings';

import {
  createMockApi,
} from '../support/mocks/vpn-api.mock';

describe('Primary VPN selection', () => {
  const mountApp = (): void => {
    cy.window().then((window) => {
      window.api = createMockApi();
    });

    cy.mount(<App />);
  };

  const selectPrimaryVpn = (id: string): void => {
    const selector = `input[type="radio"][value="${id}"]`;

    cy.get(selector)
      .should('be.enabled')
      .check();

    cy.get(selector)
      .should('be.checked');

    cy.get(selector)
      .should('be.enabled');
  };

  it('displays the primary VPN section', () => {
    mountApp();

    cy.contains('h2', 'Primary VPN')
      .should('be.visible');
  });

  it('displays all available VPN options', () => {
    mountApp();

    cy.get('input[type="radio"]')
      .should('have.length', 4);
  });

  it('has no primary VPN selected by default', () => {
    mountApp();

    cy.contains('No primary VPN selected')
      .should('be.visible');

    cy.get('input[type="radio"]:checked')
      .should('not.exist');
  });

  it('selects a primary VPN', () => {
    mountApp();

    selectPrimaryVpn('vpn-1');

    cy.contains('Primary VPN selected')
      .should('be.visible');
  });

  it('changes the primary VPN', () => {
    mountApp();

    selectPrimaryVpn('vpn-1');
    selectPrimaryVpn('vpn-2');

    cy.get('input[type="radio"][value="vpn-1"]')
      .should('not.be.checked');
  });

  it('clears the selected primary VPN', () => {
    mountApp();

    selectPrimaryVpn('vpn-1');

    cy.contains('button', 'Clear selection')
      .should('be.enabled')
      .click();

    cy.contains('No primary VPN selected')
      .should('be.visible');

    cy.get('input[type="radio"]:checked')
      .should('not.exist');
  });

  it('restores previously saved primary VPN settings', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      return api.settings.setPrimaryVpn('vpn-3')
        .then(() => {
          window.api = api;
        });
    });

    cy.mount(<App />);

    cy.get('input[type="radio"][value="vpn-3"]')
      .should('be.checked');
  });

  it('does not connect or disconnect VPNs when selecting primary', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      cy.spy(api.vpn, 'connect')
        .as('connectVpn');

      cy.spy(api.vpn, 'disconnect')
        .as('disconnectVpn');

      window.api = api;
    });

    cy.mount(<App />);

    selectPrimaryVpn('vpn-2');

    cy.get('@connectVpn')
      .should('not.have.been.called');

    cy.get('@disconnectVpn')
      .should('not.have.been.called');
  });

  it('disables unavailable VPN configurations', () => {
    const connections: VpnConnection[] = [
      {
        id: 'disabled-vpn',
        name: 'Disabled VPN',
        protocol: 'PPP:L2TP',
        status: 'disconnected',
        enabled: false,
      },
    ];

    cy.window().then((window) => {
      window.api = createMockApi(connections);
    });

    cy.mount(<App />);

    cy.get('input[type="radio"][value="disabled-vpn"]')
      .should('be.disabled');
  });

  it('handles settings loading errors', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.settings.get = () => Promise.reject(
        new Error('Storage unavailable'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('Unable to load application settings.')
      .should('be.visible');
  });

  it('handles settings persistence errors', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.settings.setPrimaryVpn = () => Promise.reject(
        new Error('Unable to save settings'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.get('input[type="radio"][value="vpn-1"]')
      .should('be.enabled')
      .check();

    cy.contains('Unable to save settings')
      .should('be.visible');

    cy.get('input[type="radio"]:checked')
      .should('not.exist');

    cy.contains('No primary VPN selected')
      .should('be.visible');
  });

  it('warns when the saved primary VPN is missing', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.settings.get = () => Promise.resolve({
        ...createDefaultSettings(),
        primaryVpnId: 'removed-vpn',
      });

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('The selected primary VPN is no longer available.')
      .should('be.visible');

    cy.contains('button', 'Clear selection')
      .should('be.enabled');
  });
});
