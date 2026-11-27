
import App from '@renderer/app/App';

import {
  type PlatformInfo,
  type SmartVpnApi,
} from '@shared/types';

const systemInfo: PlatformInfo = {
  platform: 'darwin',
  architecture: 'arm64',
  supported: true,
  appVersion: '1.0.0',
};

describe('Smart VPN application', () => {
  const mountApp = (): void => {
    cy.window().then((window) => {
      const api: SmartVpnApi = {
        system: {
          getInfo: () => Promise.resolve(systemInfo),
        },
      };

      window.api = api;
    });

    cy.mount(<App />);
  };

  beforeEach(() => {
    mountApp();
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

  it('displays the initialization status', () => {
    cy.get('[role="status"]')
      .should('contain.text', 'Application initialized');
  });

  it('displays the application description', () => {
    cy.contains('Automatic VPN management for macOS and Windows.')
      .should('be.visible');
  });

  it('uses the primary brand color', () => {
    cy.get('h1')
      .should('have.css', 'color', 'rgb(9, 39, 71)');
  });

  it('uses the yellow accent color', () => {
    cy.get('[data-testid="brand-icon"]')
      .should('have.css', 'background-color', 'rgb(255, 212, 67)');
  });

  it('displays the operating system', () => {
    cy.contains('dd', 'macOS')
      .should('be.visible');
  });

  it('displays the system architecture', () => {
    cy.contains('dd', 'arm64')
      .should('be.visible');
  });

  it('displays the application version', () => {
    cy.contains('dd', '1.0.0')
      .should('be.visible');
  });
});
