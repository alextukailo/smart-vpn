
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type AppSettings,
  type BrowserMonitoringState,
  type VpnConnection,
  type VpnOperationResult,
} from '../../../shared/types';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import { type SettingsService } from '../settings';
import { type VpnService } from '../vpn';

import { AutomationEngine } from './automation.engine';

const VPN_ID = 'primary-vpn';

const CONNECTION: VpnConnection = {
  id: VPN_ID,
  name: 'Test VPN',
  protocol: 'VPN:test',
  status: 'disconnected',
  enabled: true,
};

const MATCHING_MONITORING: BrowserMonitoringState = {
  status: 'running',

  snapshot: {
    browser: 'chrome',
    status: 'running',
    matchedRuleIds: ['rule-1'],
    matchedDomains: ['example.com'],
    checkedAt: '2026-01-01T12:00:00.000Z',
  },

  error: null,
  pollingIntervalSeconds: 3,
};

const EMPTY_MONITORING: BrowserMonitoringState = {
  ...MATCHING_MONITORING,

  snapshot: {
    browser: 'chrome',
    status: 'running',
    matchedRuleIds: [],
    matchedDomains: [],
    checkedAt: '2026-01-01T12:00:00.000Z',
  },
};

const createEnabledSettings = (): AppSettings => {
  const settings = createDefaultSettings();

  settings.primaryVpnId = VPN_ID;

  settings.automation.enabled = true;

  settings.domains = [
    {
      id: 'rule-1',
      domain: 'example.com',
      enabled: true,
      includeSubdomains: true,
    },
  ];

  return settings;
};

describe('AutomationEngine', () => {
  const settingsService = {
    get: vi.fn<SettingsService['get']>(),
  };

  const vpnService = {
    list: vi.fn<VpnService['list']>(),
    getStatus: vi.fn<VpnService['getStatus']>(),
    connect: vi.fn<VpnService['connect']>(),
  };

  let engine: AutomationEngine;

  beforeEach(() => {
    vi.resetAllMocks();

    settingsService.get.mockResolvedValue(
      createEnabledSettings(),
    );

    vpnService.list.mockResolvedValue([
      { ...CONNECTION },
    ]);

    vpnService.getStatus.mockResolvedValue(
      'disconnected',
    );

    vpnService.connect.mockResolvedValue({
      id: VPN_ID,
      status: 'connected',
      changed: true,
    });

    engine = new AutomationEngine(
      settingsService,
      vpnService,
    );
  });

  it('is disabled by default', () => {
    expect(engine.getState()).toMatchObject({
      status: 'disabled',
      ownership: 'none',
      ownedVpnId: null,
    });
  });

  it('does not connect when automation is disabled', async () => {
    settingsService.get.mockResolvedValue(
      createDefaultSettings(),
    );

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'disabled',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('waits when no primary VPN is selected', async () => {
    const settings = createEnabledSettings();

    settings.primaryVpnId = null;

    settingsService.get.mockResolvedValue(settings);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'waiting-for-vpn',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('does not connect without matching domains', async () => {
    await expect(
      engine.evaluate(EMPTY_MONITORING),
    ).resolves.toMatchObject({
      status: 'idle',
      matchedDomainCount: 0,
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('connects the primary VPN when a domain matches', async () => {
    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'automation',
      ownedVpnId: VPN_ID,
      matchedDomainCount: 1,
    });

    expect(vpnService.connect)
      .toHaveBeenCalledExactlyOnceWith(VPN_ID);
  });

  it('recognizes an externally connected VPN', async () => {
    vpnService.getStatus.mockResolvedValue(
      'connected',
    );

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'external',
      ownedVpnId: null,
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('does not claim ownership when connection was unchanged', async () => {
    vpnService.connect.mockResolvedValue({
      id: VPN_ID,
      status: 'connected',
      changed: false,
    });

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'external',
      ownedVpnId: null,
    });
  });

  it('preserves ownership across successful evaluations', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    vpnService.getStatus.mockResolvedValue(
      'connected',
    );

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'automation',
      ownedVpnId: VPN_ID,
    });

    expect(vpnService.connect)
      .toHaveBeenCalledTimes(1);
  });

  it('keeps an owned VPN connected without matching domains', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    vpnService.getStatus.mockResolvedValue(
      'connected',
    );

    await expect(
      engine.evaluate(EMPTY_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'automation',
      matchedDomainCount: 0,
    });
  });

  it('does not connect when another VPN is active', async () => {
    vpnService.list.mockResolvedValue([
      CONNECTION,
      {
        ...CONNECTION,
        id: 'another-vpn',
        name: 'Another VPN',
        status: 'connected',
      },
    ]);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'blocked',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('handles a missing primary VPN', async () => {
    vpnService.list.mockResolvedValue([]);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'waiting-for-vpn',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('handles a disabled primary VPN', async () => {
    vpnService.list.mockResolvedValue([
      {
        ...CONNECTION,
        enabled: false,
      },
    ]);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'waiting-for-vpn',
    });
  });

  it.each([
    'connecting',
    'disconnecting',
    'unknown',
  ] as const)('blocks activation with VPN status %s', async (status) => {
    vpnService.getStatus.mockResolvedValue(status);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'blocked',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('does not activate VPN after a failed browser scan', async () => {
    await expect(
      engine.evaluate({
        ...MATCHING_MONITORING,
        status: 'error',
        snapshot: null,
        error: 'Scan failed',
      }),
    ).resolves.toMatchObject({
      status: 'suspended',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('does not activate VPN while monitoring is stopped', async () => {
    await expect(
      engine.evaluate({
        ...MATCHING_MONITORING,
        status: 'stopped',
        snapshot: null,
      }),
    ).resolves.toMatchObject({
      status: 'suspended',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('preserves ownership after a browser scan failure', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    await expect(
      engine.evaluate({
        ...MATCHING_MONITORING,
        status: 'error',
        snapshot: null,
      }),
    ).resolves.toMatchObject({
      status: 'suspended',
      ownership: 'automation',
      ownedVpnId: VPN_ID,
    });
  });

  it('does not reconnect an owned VPN that was externally disconnected', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    vpnService.getStatus.mockResolvedValue(
      'disconnected',
    );

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'suspended',
      ownership: 'none',
      ownedVpnId: null,
    });

    expect(vpnService.connect)
      .toHaveBeenCalledTimes(1);
  });

  it('clears manual suspension when matching domains disappear', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    await engine.evaluate(MATCHING_MONITORING);

    await engine.evaluate(EMPTY_MONITORING);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'automation',
    });

    expect(vpnService.connect)
      .toHaveBeenCalledTimes(2);
  });

  it('handles native VPN connection failures', async () => {
    vpnService.connect.mockRejectedValue(
      new Error('Connection failed'),
    );

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'error',
      ownership: 'none',
      error: 'Automatic VPN activation failed.',
    });
  });

  it('does not claim ownership of an unconfirmed connection', async () => {
    vpnService.connect.mockResolvedValue({
      id: VPN_ID,
      status: 'connecting',
      changed: true,
    });

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'error',
      ownedVpnId: null,
    });
  });

  it('recovers from a failed activation', async () => {
    vpnService.connect.mockRejectedValueOnce(
      new Error('Temporary failure'),
    );

    await engine.evaluate(MATCHING_MONITORING);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'connected',
      ownership: 'automation',
      error: null,
    });
  });

  it('deduplicates concurrent evaluations', async () => {
    const first = engine.evaluate(
      MATCHING_MONITORING,
    );

    const second = engine.evaluate(
      MATCHING_MONITORING,
    );

    expect(first).toBe(second);

    await Promise.all([
      first,
      second,
    ]);

    expect(vpnService.connect)
      .toHaveBeenCalledTimes(1);
  });

  it('releases ownership when automation is disabled', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    const settings = createEnabledSettings();

    settings.automation.enabled = false;

    settingsService.get.mockResolvedValue(settings);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'disabled',
      ownership: 'none',
      ownedVpnId: null,
    });
  });

  it('releases ownership when the primary VPN changes', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    const settings = createEnabledSettings();

    settings.primaryVpnId = 'another-vpn';
    settings.automation.enabled = false;

    settingsService.get.mockResolvedValue(settings);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'disabled',
      ownership: 'none',
      ownedVpnId: null,
      primaryVpnId: 'another-vpn',
    });
  });

  it('revalidates settings before connecting', async () => {
    const disabledSettings = createEnabledSettings();

    disabledSettings.automation.enabled = false;

    settingsService.get
      .mockResolvedValueOnce(createEnabledSettings())
      .mockResolvedValueOnce(disabledSettings);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'suspended',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('does not connect using an outdated domain configuration', async () => {
    const updatedSettings = createEnabledSettings();

    updatedSettings.domains = [];

    settingsService.get
      .mockResolvedValueOnce(createEnabledSettings())
      .mockResolvedValueOnce(updatedSettings);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'suspended',
    });

    expect(vpnService.connect)
      .not.toHaveBeenCalled();
  });

  it('supports explicit manual suspension', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    engine.suspend(VPN_ID);

    await expect(
      engine.evaluate(MATCHING_MONITORING),
    ).resolves.toMatchObject({
      status: 'suspended',
      ownership: 'none',
    });

    expect(vpnService.connect)
      .toHaveBeenCalledTimes(1);
  });

  it('resets automation state', async () => {
    await engine.evaluate(MATCHING_MONITORING);

    expect(engine.reset()).toMatchObject({
      status: 'disabled',
      ownership: 'none',
      primaryVpnId: null,
      ownedVpnId: null,
      matchedDomainCount: 0,
    });
  });

  it('discards connection results after a reset', async () => {
    let resolveConnection:
    (result: VpnOperationResult) => void = () => undefined;

    vpnService.connect.mockImplementationOnce(
      () => new Promise<VpnOperationResult>((resolve) => {
        resolveConnection = resolve;
      }),
    );

    const evaluation = engine.evaluate(
      MATCHING_MONITORING,
    );

    await vi.waitFor(() => {
      expect(vpnService.connect)
        .toHaveBeenCalledTimes(1);
    });

    engine.reset();

    resolveConnection({
      id: VPN_ID,
      status: 'connected',
      changed: true,
    });

    await expect(evaluation).resolves.toMatchObject({
      status: 'disabled',
      ownedVpnId: null,
      ownership: 'none',
    });
  });

  it('protects internal state from external mutation', () => {
    const state = engine.getState();

    state.status = 'connected';

    expect(engine.getState().status)
      .toBe('disabled');
  });
});
