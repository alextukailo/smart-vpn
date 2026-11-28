
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type BrowserMonitoringSnapshot,
} from '../../../shared/types';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import { type BrowserService } from '../browser';
import { type SettingsService } from '../settings';

import {
  BrowserMonitoringService,
} from './browser-monitoring.service';

const SNAPSHOT: BrowserMonitoringSnapshot = {
  browser: 'chrome',
  status: 'running',
  matchedRuleIds: ['rule-1'],
  matchedDomains: ['example.com'],
  checkedAt: '2026-01-01T12:00:00.000Z',
};

describe('BrowserMonitoringService', () => {
  const browserService = {
    scan: vi.fn<BrowserService['scan']>(),
  };

  const settingsService = {
    get: vi.fn<SettingsService['get']>(),
  };

  let service: BrowserMonitoringService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();

    browserService.scan.mockResolvedValue(
      SNAPSHOT,
    );

    settingsService.get.mockResolvedValue(
      createDefaultSettings(),
    );

    service = new BrowserMonitoringService(
      browserService,
      settingsService,
    );
  });

  afterEach(() => {
    service.stop();

    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('is stopped by default', () => {
    expect(service.getState()).toEqual({
      status: 'stopped',
      snapshot: null,
      error: null,
      pollingIntervalSeconds: 3,
    });
  });

  it('does not scan before monitoring starts', async () => {
    await vi.advanceTimersByTimeAsync(10_000);

    expect(browserService.scan)
      .not.toHaveBeenCalled();
  });

  it('enters the starting state immediately', () => {
    expect(service.start()).toMatchObject({
      status: 'starting',
      snapshot: null,
    });
  });

  it('performs the initial scan', async () => {
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    expect(service.getState()).toMatchObject({
      status: 'running',
      snapshot: SNAPSHOT,
      error: null,
    });
  });

  it('polls using the configured interval', async () => {
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2_999);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(2);
  });

  it('uses a custom polling interval', async () => {
    const settings = createDefaultSettings();

    settings.automation.pollingIntervalSeconds = 5;

    settingsService.get.mockResolvedValue(
      settings,
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState()).toMatchObject({
      pollingIntervalSeconds: 5,
    });

    await vi.advanceTimersByTimeAsync(4_999);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(2);
  });

  it('does not start duplicate monitoring loops', async () => {
    service.start();
    service.start();
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3_000);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(2);
  });

  it('stops scheduled scans', async () => {
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    service.stop();

    await vi.advanceTimersByTimeAsync(30_000);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    expect(service.getState()).toMatchObject({
      status: 'stopped',
      snapshot: null,
    });
  });

  it('can stop before the first scan', async () => {
    service.start();
    service.stop();

    await vi.advanceTimersByTimeAsync(0);

    expect(browserService.scan)
      .not.toHaveBeenCalled();
  });

  it('recovers after a failed scan', async () => {
    browserService.scan.mockRejectedValueOnce(
      new Error('Native command failed'),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState()).toMatchObject({
      status: 'error',
      snapshot: null,
      error: expect.any(String),
    });

    await vi.advanceTimersByTimeAsync(3_000);

    expect(service.getState()).toMatchObject({
      status: 'running',
      snapshot: SNAPSHOT,
      error: null,
    });
  });

  it('does not expose raw native error messages', async () => {
    browserService.scan.mockRejectedValueOnce(
      new Error('https://example.com?token=private'),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState().error)
      .not.toContain('token=private');
  });

  it('handles settings loading failures', async () => {
    settingsService.get.mockRejectedValueOnce(
      new Error('Settings unavailable'),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState().status)
      .toBe('error');

    expect(browserService.scan)
      .not.toHaveBeenCalled();
  });

  it('clears a stale snapshot when a subsequent scan fails', async () => {
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState().snapshot)
      .toEqual(SNAPSHOT);

    browserService.scan.mockRejectedValueOnce(
      new Error('Scan failed'),
    );

    await vi.advanceTimersByTimeAsync(3_000);

    expect(service.getState()).toMatchObject({
      status: 'error',
      snapshot: null,
    });
  });

  it('does not overlap slow browser scans', async () => {
    let resolveScan:
    (value: BrowserMonitoringSnapshot) => void = () => undefined;

    browserService.scan.mockImplementationOnce(
      () => new Promise<BrowserMonitoringSnapshot>((resolve) => {
        resolveScan = resolve;
      }),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    await vi.advanceTimersByTimeAsync(15_000);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    resolveScan(SNAPSHOT);

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState().status)
      .toBe('running');

    await vi.advanceTimersByTimeAsync(3_000);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(2);
  });

  it('discards scan results after monitoring stops', async () => {
    let resolveScan:
    (value: BrowserMonitoringSnapshot) => void = () => undefined;

    browserService.scan.mockImplementationOnce(
      () => new Promise<BrowserMonitoringSnapshot>((resolve) => {
        resolveScan = resolve;
      }),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    service.stop();

    resolveScan(SNAPSHOT);

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState()).toMatchObject({
      status: 'stopped',
      snapshot: null,
      error: null,
    });
  });

  it('waits for an old scan before starting a new session', async () => {
    let resolveScan:
    (value: BrowserMonitoringSnapshot) => void = () => undefined;

    browserService.scan.mockImplementationOnce(
      () => new Promise<BrowserMonitoringSnapshot>((resolve) => {
        resolveScan = resolve;
      }),
    );

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    service.stop();
    service.start();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(1);

    expect(service.getState().status)
      .toBe('starting');

    resolveScan(SNAPSHOT);

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1);

    expect(browserService.scan)
      .toHaveBeenCalledTimes(2);

    expect(service.getState().status)
      .toBe('running');
  });

  it('protects internal state from external mutation', async () => {
    service.start();

    await vi.advanceTimersByTimeAsync(0);

    const state = service.getState();

    state.snapshot?.matchedDomains.push(
      'unexpected.com',
    );

    expect(
      service.getState().snapshot?.matchedDomains,
    ).toEqual([
      'example.com',
    ]);
  });

  it('distinguishes a closed browser from a failed scan', async () => {
    browserService.scan.mockResolvedValue({
      ...SNAPSHOT,
      status: 'not-running',
      matchedRuleIds: [],
      matchedDomains: [],
    });

    service.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.getState()).toMatchObject({
      status: 'running',
      error: null,

      snapshot: {
        status: 'not-running',
        matchedDomains: [],
      },
    });
  });
});
