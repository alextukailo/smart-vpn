
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { type VpnConnection } from '../../../shared/types';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import {
  type ISettingsRepository,
} from '../../repositories/settings';

import { type VpnService } from '../vpn';

import { SettingsService } from './settings.service';

const VPN_ID = 'test-vpn';

const connection: VpnConnection = {
  id: VPN_ID,
  name: 'Test VPN',
  protocol: 'VPN:test',
  status: 'disconnected',
  enabled: true,
};

describe('SettingsService', () => {
  const repository = {
    load: vi.fn<ISettingsRepository['load']>(),
    save: vi.fn<ISettingsRepository['save']>(),
  };

  const vpnService = {
    list: vi.fn<VpnService['list']>(),
  };

  let service: SettingsService;

  beforeEach(() => {
    vi.resetAllMocks();

    repository.load.mockResolvedValue(
      createDefaultSettings(),
    );

    repository.save.mockResolvedValue(undefined);

    vpnService.list.mockResolvedValue([
      { ...connection },
    ]);

    service = new SettingsService(
      repository,
      vpnService,
    );
  });

  it('returns default settings', async () => {
    await expect(
      service.get(),
    ).resolves.toEqual(
      createDefaultSettings(),
    );
  });

  it('caches loaded settings', async () => {
    await service.get();
    await service.get();

    expect(repository.load)
      .toHaveBeenCalledTimes(1);
  });

  it('protects internal settings from mutation', async () => {
    const settings = await service.get();

    settings.automation.enabled = true;

    const actual = await service.get();

    expect(actual.automation.enabled).toBe(false);
  });

  it('selects a primary VPN', async () => {
    await expect(
      service.setPrimaryVpn(VPN_ID),
    ).resolves.toMatchObject({
      primaryVpnId: VPN_ID,
    });

    expect(repository.save)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          primaryVpnId: VPN_ID,
        }),
      );
  });

  it('clears the primary VPN', async () => {
    await service.setPrimaryVpn(VPN_ID);

    await expect(
      service.setPrimaryVpn(null),
    ).resolves.toMatchObject({
      primaryVpnId: null,
    });
  });

  it('rejects an unknown VPN', async () => {
    await expect(
      service.setPrimaryVpn('unknown'),
    ).rejects.toThrow(
      'VPN connection not found',
    );

    expect(repository.save)
      .not.toHaveBeenCalled();
  });

  it('rejects a disabled VPN', async () => {
    vpnService.list.mockResolvedValue([
      {
        ...connection,
        enabled: false,
      },
    ]);

    await expect(
      service.setPrimaryVpn(VPN_ID),
    ).rejects.toThrow(
      'VPN connection is disabled',
    );
  });

  it('disables automation when clearing the primary VPN', async () => {
    const settings = createDefaultSettings();

    settings.primaryVpnId = VPN_ID;
    settings.automation.enabled = true;

    repository.load.mockResolvedValue(settings);

    await expect(
      service.setPrimaryVpn(null),
    ).resolves.toMatchObject({
      primaryVpnId: null,
      automation: {
        enabled: false,
      },
    });
  });

  it('preserves settings when saving fails', async () => {
    repository.save.mockRejectedValueOnce(
      new Error('Storage unavailable'),
    );

    await expect(
      service.setPrimaryVpn(VPN_ID),
    ).rejects.toThrow('Storage unavailable');

    await expect(
      service.get(),
    ).resolves.toMatchObject({
      primaryVpnId: null,
    });
  });

  it('continues processing after a failed operation', async () => {
    await expect(
      service.setPrimaryVpn('unknown'),
    ).rejects.toThrow();

    await expect(
      service.setPrimaryVpn(VPN_ID),
    ).resolves.toMatchObject({
      primaryVpnId: VPN_ID,
    });
  });

  it('serializes concurrent settings updates', async () => {
    const first = service.setPrimaryVpn(VPN_ID);
    const second = service.setPrimaryVpn(null);

    await Promise.all([
      first,
      second,
    ]);

    await expect(
      service.get(),
    ).resolves.toMatchObject({
      primaryVpnId: null,
    });

    expect(repository.save)
      .toHaveBeenCalledTimes(2);
  });
});
