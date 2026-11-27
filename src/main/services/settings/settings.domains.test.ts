
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import {
  type ISettingsRepository,
} from '../../repositories/settings';

import { type VpnService } from '../vpn';

import { SettingsService } from './settings.service';

describe('SettingsService domain management', () => {
  const repository = {
    load: vi.fn<ISettingsRepository['load']>(),
    save: vi.fn<ISettingsRepository['save']>(),
  };

  const vpnService = {
    list: vi.fn<VpnService['list']>(),
  };

  let service: SettingsService;

  const addExampleDomain = () => {
    return service.addDomain({
      domain: 'example.com',
      includeSubdomains: true,
    });
  };

  beforeEach(() => {
    vi.resetAllMocks();

    repository.load.mockResolvedValue(
      createDefaultSettings(),
    );

    repository.save.mockResolvedValue(undefined);

    vpnService.list.mockResolvedValue([]);

    service = new SettingsService(
      repository,
      vpnService,
    );
  });

  it('adds an enabled domain rule', async () => {
    const settings = await addExampleDomain();

    expect(settings.domains).toHaveLength(1);

    expect(settings.domains[0]).toEqual({
      id: expect.any(String),
      domain: 'example.com',
      enabled: true,
      includeSubdomains: true,
    });
  });

  it('normalizes a complete URL', async () => {
    const settings = await service.addDomain({
      domain: 'https://EXAMPLE.COM/path?q=test#section',
      includeSubdomains: true,
    });

    expect(settings.domains[0].domain)
      .toBe('example.com');
  });

  it('supports exact domain matching', async () => {
    const settings = await service.addDomain({
      domain: 'example.com',
      includeSubdomains: false,
    });

    expect(settings.domains[0].includeSubdomains)
      .toBe(false);
  });

  it('rejects duplicate domains', async () => {
    await addExampleDomain();

    await expect(
      service.addDomain({
        domain: 'https://EXAMPLE.COM/page',
        includeSubdomains: false,
      }),
    ).rejects.toThrow('This domain already exists');
  });

  it.each([
    '',
    'invalid domain',
    'ftp://example.com',
    'localhost',
  ])('rejects invalid domain "%s"', async (domain) => {
    await expect(
      service.addDomain({
        domain,
        includeSubdomains: true,
      }),
    ).rejects.toThrow('Invalid domain or URL');
  });

  it('generates unique domain identifiers', async () => {
    await addExampleDomain();

    const settings = await service.addDomain({
      domain: 'another.com',
      includeSubdomains: true,
    });

    expect(settings.domains[0].id)
      .not.toBe(settings.domains[1].id);
  });

  it('updates a domain without changing its identifier', async () => {
    const initial = await addExampleDomain();

    const rule = initial.domains[0];

    const updated = await service.updateDomain({
      ...rule,
      domain: 'another.com',
    });

    expect(updated.domains[0]).toEqual({
      ...rule,
      domain: 'another.com',
    });
  });

  it('disables a domain rule', async () => {
    const initial = await addExampleDomain();

    const updated = await service.updateDomain({
      ...initial.domains[0],
      enabled: false,
    });

    expect(updated.domains[0].enabled).toBe(false);
  });

  it('changes subdomain matching', async () => {
    const initial = await addExampleDomain();

    const updated = await service.updateDomain({
      ...initial.domains[0],
      includeSubdomains: false,
    });

    expect(updated.domains[0].includeSubdomains)
      .toBe(false);
  });

  it('rejects updates to unknown rules', async () => {
    await expect(
      service.updateDomain({
        id: 'missing',
        domain: 'example.com',
        enabled: true,
        includeSubdomains: true,
      }),
    ).rejects.toThrow('Domain rule not found');
  });

  it('rejects an update that creates a duplicate domain', async () => {
    await addExampleDomain();

    const settings = await service.addDomain({
      domain: 'another.com',
      includeSubdomains: true,
    });

    await expect(
      service.updateDomain({
        ...settings.domains[1],
        domain: 'example.com',
      }),
    ).rejects.toThrow('This domain already exists');
  });

  it('removes an existing domain rule', async () => {
    const initial = await addExampleDomain();

    const settings = await service.removeDomain(
      initial.domains[0].id,
    );

    expect(settings.domains).toEqual([]);
  });

  it('rejects removal of an unknown rule', async () => {
    await expect(
      service.removeDomain('unknown'),
    ).rejects.toThrow('Domain rule not found');
  });

  it('preserves rules when persistence fails', async () => {
    await addExampleDomain();

    repository.save.mockRejectedValueOnce(
      new Error('Storage unavailable'),
    );

    await expect(
      service.addDomain({
        domain: 'another.com',
        includeSubdomains: true,
      }),
    ).rejects.toThrow('Storage unavailable');

    const settings = await service.get();

    expect(settings.domains).toHaveLength(1);
    expect(settings.domains[0].domain).toBe('example.com');
  });

  it('serializes concurrent domain creation', async () => {
    await Promise.all([
      addExampleDomain(),

      service.addDomain({
        domain: 'another.com',
        includeSubdomains: true,
      }),
    ]);

    const settings = await service.get();

    expect(settings.domains).toHaveLength(2);
  });

  it('rejects concurrent duplicate creation', async () => {
    const results = await Promise.allSettled([
      addExampleDomain(),
      addExampleDomain(),
    ]);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');

    const settings = await service.get();

    expect(settings.domains).toHaveLength(1);
  });

  it('protects stored domain rules from external mutation', async () => {
    const settings = await addExampleDomain();

    settings.domains[0].enabled = false;

    const actual = await service.get();

    expect(actual.domains[0].enabled).toBe(true);
  });

  it('does not activate VPN automation when adding a domain', async () => {
    const settings = await addExampleDomain();

    expect(settings.automation.enabled).toBe(false);

    expect(vpnService.list).not.toHaveBeenCalled();
  });
});
