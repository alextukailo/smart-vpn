
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type BrowserScanResult,
} from '../../../shared/types';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import {
  type IBrowserAdapter,
} from '../../adapters/browser';

import {
  type SettingsService,
} from '../settings';

import { BrowserService } from './browser.service';

describe('BrowserService', () => {
  const adapter = {
    id: 'chrome' as const,

    scan: vi.fn<IBrowserAdapter['scan']>(),
  };

  const settingsService = {
    get: vi.fn<SettingsService['get']>(),
  };

  let service: BrowserService;

  beforeEach(() => {
    vi.resetAllMocks();

    adapter.scan.mockResolvedValue({
      browser: 'chrome',
      status: 'running',
      domains: [
        'example.com',
        'unrelated.com',
      ],
    });

    settingsService.get.mockResolvedValue({
      ...createDefaultSettings(),

      domains: [
        {
          id: 'rule-1',
          domain: 'example.com',
          enabled: true,
          includeSubdomains: true,
        },
      ],
    });

    service = new BrowserService(
      adapter,
      settingsService,
    );
  });

  it('returns a matching browser snapshot', async () => {
    await expect(
      service.scan(),
    ).resolves.toMatchObject({
      browser: 'chrome',
      status: 'running',
      matchedRuleIds: ['rule-1'],
      matchedDomains: ['example.com'],
    });
  });

  it('does not expose unrelated browsing domains', async () => {
    const snapshot = await service.scan();

    expect(snapshot.matchedDomains)
      .not.toContain('unrelated.com');

    expect(snapshot)
      .not.toHaveProperty('domains');
  });

  it('includes a valid scan timestamp', async () => {
    const snapshot = await service.scan();

    const checkedAt = new Date(
      snapshot.checkedAt,
    );

    expect(
      Number.isNaN(checkedAt.getTime()),
    ).toBe(false);

    expect(checkedAt.toISOString())
      .toBe(snapshot.checkedAt);
  });

  it('detects a closed browser', async () => {
    adapter.scan.mockResolvedValue({
      browser: 'chrome',
      status: 'not-running',
      domains: [],
    });

    await expect(
      service.scan(),
    ).resolves.toMatchObject({
      status: 'not-running',
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('returns empty matches without configured domains', async () => {
    settingsService.get.mockResolvedValue(
      createDefaultSettings(),
    );

    await expect(
      service.scan(),
    ).resolves.toMatchObject({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('uses the latest application settings', async () => {
    await service.scan();

    settingsService.get.mockResolvedValue(
      createDefaultSettings(),
    );

    await expect(
      service.scan(),
    ).resolves.toMatchObject({
      matchedRuleIds: [],
      matchedDomains: [],
    });

    expect(settingsService.get)
      .toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent scan requests', async () => {
    let resolveScan:
    (value: BrowserScanResult) => void = () => undefined;

    adapter.scan.mockImplementationOnce(
      () => new Promise<BrowserScanResult>((resolve) => {
        resolveScan = resolve;
      }),
    );

    const first = service.scan();
    const second = service.scan();
    const third = service.scan();

    expect(first).toBe(second);
    expect(second).toBe(third);

    expect(adapter.scan)
      .toHaveBeenCalledTimes(1);

    resolveScan({
      browser: 'chrome',
      status: 'running',
      domains: ['example.com'],
    });

    const results = await Promise.all([
      first,
      second,
      third,
    ]);

    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
  });

  it('performs a new scan after completion', async () => {
    await service.scan();
    await service.scan();

    expect(adapter.scan)
      .toHaveBeenCalledTimes(2);
  });

  it('propagates browser scan errors', async () => {
    adapter.scan.mockRejectedValue(
      new Error('Browser scan failed'),
    );

    await expect(
      service.scan(),
    ).rejects.toThrow('Browser scan failed');
  });

  it('propagates settings loading errors', async () => {
    settingsService.get.mockRejectedValue(
      new Error('Settings unavailable'),
    );

    await expect(
      service.scan(),
    ).rejects.toThrow('Settings unavailable');
  });

  it('allows another scan after a failed operation', async () => {
    adapter.scan.mockRejectedValueOnce(
      new Error('Browser scan failed'),
    );

    await expect(
      service.scan(),
    ).rejects.toThrow('Browser scan failed');

    await expect(
      service.scan(),
    ).resolves.toMatchObject({
      matchedDomains: ['example.com'],
    });

    expect(adapter.scan)
      .toHaveBeenCalledTimes(2);
  });
});
