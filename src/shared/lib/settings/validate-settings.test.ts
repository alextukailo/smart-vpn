
import {
  describe,
  expect,
  it,
} from 'vitest';

import { createDefaultSettings } from './default-settings';
import { isValidSettings } from './validate-settings';

describe('isValidSettings', () => {
  it('accepts default settings', () => {
    expect(
      isValidSettings(createDefaultSettings()),
    ).toBe(true);
  });

  it('creates independent default settings', () => {
    const first = createDefaultSettings();
    const second = createDefaultSettings();

    first.automation.enabled = true;

    expect(second.automation.enabled).toBe(false);
  });

  it.each([
    null,
    undefined,
    [],
    {},
    'invalid',
    123,
  ])('rejects invalid settings: %s', (value) => {
    expect(isValidSettings(value)).toBe(false);
  });

  it('rejects unsupported versions', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),
        version: 2,
      }),
    ).toBe(false);
  });

  it('accepts a selected primary VPN', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),
        primaryVpnId: 'test-vpn',
      }),
    ).toBe(true);
  });

  it('rejects an invalid VPN identifier', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),
        primaryVpnId: '',
      }),
    ).toBe(false);
  });

  it('accepts a valid domain rule', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),
        domains: [
          {
            id: 'domain-1',
            domain: 'example.com',
            enabled: true,
            includeSubdomains: true,
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects an unnormalized domain', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),
        domains: [
          {
            id: 'domain-1',
            domain: 'https://example.com/path',
            enabled: true,
            includeSubdomains: true,
          },
        ],
      }),
    ).toBe(false);
  });

  it.each([
    -1,
    3601,
    1.5,
    '30',
  ])('rejects invalid disconnect delay: %s', (value) => {
    const settings = createDefaultSettings();

    expect(
      isValidSettings({
        ...settings,
        automation: {
          ...settings.automation,
          disconnectDelaySeconds: value,
        },
      }),
    ).toBe(false);
  });

  it.each([
    0,
    61,
    -1,
    1.5,
  ])('rejects invalid polling interval: %s', (value) => {
    const settings = createDefaultSettings();

    expect(
      isValidSettings({
        ...settings,
        automation: {
          ...settings.automation,
          pollingIntervalSeconds: value,
        },
      }),
    ).toBe(false);
  });
});
