
import App from '@renderer/app/App';

import {
  createMockApi,
} from '../support/mocks/vpn-api.mock';

import {
  createMonitoringMock,
} from '../support/mocks/monitoring-api.mock';

describe('Browser monitoring', () => {
  const mountApp = (): void => {
    cy.window().then((window) => {
      window.api = createMockApi();
    });

    cy.mount(<App />);
  };

  const startMonitoring = (): void => {
    cy.contains('button', 'Start monitoring')
      .should('be.enabled')
      .click();

    cy.contains('button', 'Stop monitoring')
      .should('be.enabled');
  };

  it('displays the monitoring section', () => {
    mountApp();

    cy.contains('h2', 'Browser monitoring')
      .should('be.visible');
  });

  it('is stopped by default', () => {
    mountApp();

    cy.contains('[role="status"]', /^Stopped$/)
      .should('be.visible');

    cy.contains('button', 'Start monitoring')
      .should('be.enabled');
  });

  it('starts monitoring', () => {
    mountApp();

    startMonitoring();

    cy.contains('[role="status"]', /^Monitoring$/)
      .should('be.visible');
  });

  it('stops monitoring', () => {
    mountApp();

    startMonitoring();

    cy.contains('button', 'Stop monitoring')
      .click();

    cy.contains('button', 'Start monitoring')
      .should('be.enabled');

    cy.contains('[role="status"]', /^Stopped$/)
      .should('be.visible');
  });

  it('displays the browser status', () => {
    mountApp();

    startMonitoring();

    cy.contains('dd', /^Running$/)
      .should('be.visible');
  });

  it('displays the polling interval', () => {
    mountApp();

    cy.contains('dd', '3 seconds')
      .should('be.visible');
  });

  it('displays matching domains', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring = createMonitoringMock({
        browser: 'chrome',
        status: 'running',

        matchedRuleIds: [
          'rule-1',
          'rule-2',
        ],

        matchedDomains: [
          'example.com',
          'another.com',
        ],

        checkedAt: '2026-01-01T12:00:00.000Z',
      });

      window.api = api;
    });

    cy.mount(<App />);

    startMonitoring();

    cy.get('[data-testid="matched-domain"]')
      .should('have.length', 2);

    cy.get('[data-testid="matched-domain-count"]')
      .should('have.text', '2');
  });

  it('displays an empty matching state', () => {
    mountApp();

    startMonitoring();

    cy.contains('No matching domains detected.')
      .should('be.visible');

    cy.get('[data-testid="matched-domain-count"]')
      .should('have.text', '0');
  });

  it('detects when Chrome is closed', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring = createMonitoringMock({
        browser: 'chrome',
        status: 'not-running',
        matchedRuleIds: [],
        matchedDomains: [],
        checkedAt: '2026-01-01T12:00:00.000Z',
      });

      window.api = api;
    });

    cy.mount(<App />);

    startMonitoring();

    cy.contains('dd', /^Not running$/)
      .should('be.visible');
  });

  it('clears matches when monitoring stops', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring = createMonitoringMock({
        browser: 'chrome',
        status: 'running',
        matchedRuleIds: ['rule-1'],
        matchedDomains: ['example.com'],
        checkedAt: '2026-01-01T12:00:00.000Z',
      });

      window.api = api;
    });

    cy.mount(<App />);

    startMonitoring();

    cy.get('[data-testid="matched-domain"]')
      .should('have.length', 1);

    cy.contains('button', 'Stop monitoring')
      .click();

    cy.get('[data-testid="matched-domain"]')
      .should('not.exist');

    cy.contains('button', 'Start monitoring')
      .should('be.enabled');
  });

  it('handles monitoring state retrieval errors', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring.getState = () => Promise.reject(
        new Error('Monitoring unavailable'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('Unable to retrieve monitoring state.')
      .should('be.visible');
  });

  it('handles monitoring startup errors', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring.start = () => Promise.reject(
        new Error('Unable to start monitoring'),
      );

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('button', 'Start monitoring')
      .click();

    cy.contains('Unable to start monitoring')
      .should('be.visible');
  });

  it('displays scan failures without reporting zero matches', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.monitoring.getState = () => Promise.resolve({
        status: 'error',
        snapshot: null,
        error: 'Chrome permission denied',
        pollingIntervalSeconds: 3,
      });

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('Chrome permission denied')
      .should('be.visible');

    cy.contains('Monitoring will retry automatically.')
      .should('be.visible');

    cy.get('[data-testid="matched-domain-count"]')
      .should('have.text', '—');
  });

  it('does not activate VPN when monitoring starts', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      cy.spy(api.vpn, 'connect')
        .as('connectVpn');

      cy.spy(api.vpn, 'disconnect')
        .as('disconnectVpn');

      window.api = api;
    });

    cy.mount(<App />);

    startMonitoring();

    cy.get('@connectVpn')
      .should('not.have.been.called');

    cy.get('@disconnectVpn')
      .should('not.have.been.called');
  });

  it('disables browser monitoring on Windows', () => {
    cy.window().then((window) => {
      const api = createMockApi();

      api.system.getInfo = () => Promise.resolve({
        platform: 'win32',
        architecture: 'x64',
        supported: true,
        appVersion: '1.0.0',
      });

      window.api = api;
    });

    cy.mount(<App />);

    cy.contains('Windows · X64')
      .should('be.visible');

    cy.contains(
      'Browser monitoring is currently available only on macOS.',
    ).should('be.visible');

    cy.contains('button', 'Start monitoring')
      .should('not.exist');
  });
});
