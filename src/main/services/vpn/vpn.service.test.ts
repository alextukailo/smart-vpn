
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type VpnConnection,
} from '../../../shared/types';

import {
  type IVpnAdapter,
} from '../../adapters/vpn';

import { VpnService } from './vpn.service';

const VPN_ID = 'test-vpn';

const connection: VpnConnection = {
  id: VPN_ID,
  name: 'Test VPN',
  protocol: 'VPN:test',
  status: 'disconnected',
  enabled: true,
};

describe('VpnService', () => {
  const adapter = {
    list: vi.fn<IVpnAdapter['list']>(),
    getStatus: vi.fn<IVpnAdapter['getStatus']>(),
    connect: vi.fn<IVpnAdapter['connect']>(),
    disconnect: vi.fn<IVpnAdapter['disconnect']>(),
  };

  const service = new VpnService(adapter, {
    connectionTimeout: 100,
    disconnectionTimeout: 100,
    pollingInterval: 5,
  });

  beforeEach(() => {
    vi.resetAllMocks();

    adapter.list.mockResolvedValue([
      { ...connection },
    ]);

    adapter.getStatus.mockResolvedValue(
      'disconnected',
    );

    adapter.connect.mockResolvedValue(undefined);
    adapter.disconnect.mockResolvedValue(undefined);
  });

  it('returns available VPN connections', async () => {
    await expect(
      service.list(),
    ).resolves.toEqual([connection]);
  });

  it('returns the current connection status', async () => {
    adapter.getStatus.mockResolvedValue('connected');

    await expect(
      service.getStatus(VPN_ID),
    ).resolves.toBe('connected');
  });

  it('connects a disconnected VPN', async () => {
    adapter.getStatus
      .mockResolvedValueOnce('disconnected')
      .mockResolvedValueOnce('connecting')
      .mockResolvedValue('connected');

    await expect(
      service.connect(VPN_ID),
    ).resolves.toEqual({
      id: VPN_ID,
      status: 'connected',
      changed: true,
    });

    expect(adapter.connect)
      .toHaveBeenCalledExactlyOnceWith(VPN_ID);
  });

  it('does not reconnect an already connected VPN', async () => {
    adapter.getStatus.mockResolvedValue('connected');

    await expect(
      service.connect(VPN_ID),
    ).resolves.toEqual({
      id: VPN_ID,
      status: 'connected',
      changed: false,
    });

    expect(adapter.connect)
      .not.toHaveBeenCalled();
  });

  it('disconnects a connected VPN', async () => {
    adapter.getStatus
      .mockResolvedValueOnce('connected')
      .mockResolvedValueOnce('disconnecting')
      .mockResolvedValue('disconnected');

    await expect(
      service.disconnect(VPN_ID),
    ).resolves.toEqual({
      id: VPN_ID,
      status: 'disconnected',
      changed: true,
    });

    expect(adapter.disconnect)
      .toHaveBeenCalledExactlyOnceWith(VPN_ID);
  });

  it('does not disconnect an inactive VPN', async () => {
    await expect(
      service.disconnect(VPN_ID),
    ).resolves.toEqual({
      id: VPN_ID,
      status: 'disconnected',
      changed: false,
    });

    expect(adapter.disconnect)
      .not.toHaveBeenCalled();
  });

  it('rejects an unknown VPN connection', async () => {
    await expect(
      service.connect('unknown-vpn'),
    ).rejects.toThrow('VPN connection not found');

    expect(adapter.connect)
      .not.toHaveBeenCalled();
  });

  it('rejects a disabled VPN connection', async () => {
    adapter.list.mockResolvedValue([
      {
        ...connection,
        enabled: false,
      },
    ]);

    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow('VPN connection is disabled');

    expect(adapter.connect)
      .not.toHaveBeenCalled();
  });

  it('does not disconnect another active VPN', async () => {
    adapter.list.mockResolvedValue([
      connection,
      {
        ...connection,
        id: 'another-vpn',
        name: 'Another VPN',
        status: 'connected',
      },
    ]);

    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow('Another VPN is active');

    expect(adapter.connect)
      .not.toHaveBeenCalled();

    expect(adapter.disconnect)
      .not.toHaveBeenCalled();
  });

  it('rejects connection during a transitional state', async () => {
    adapter.getStatus.mockResolvedValue('connecting');

    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow(
      'Cannot connect VPN with status: connecting',
    );

    expect(adapter.connect)
      .not.toHaveBeenCalled();
  });

  it('rejects concurrent VPN operations', async () => {
    adapter.getStatus
      .mockResolvedValueOnce('disconnected')
      .mockResolvedValue('connected');

    const firstOperation = service.connect(VPN_ID);

    await expect(
      service.disconnect(VPN_ID),
    ).rejects.toThrow(
      'Another VPN operation is already in progress',
    );

    await expect(firstOperation).resolves.toMatchObject({
      status: 'connected',
    });
  });

  it('handles connection timeouts', async () => {
    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow('VPN operation timed out');
  });

  it('handles disconnection timeouts', async () => {
    adapter.getStatus.mockResolvedValue('connected');

    await expect(
      service.disconnect(VPN_ID),
    ).rejects.toThrow('VPN operation timed out');
  });

  it('propagates adapter errors', async () => {
    adapter.connect.mockRejectedValue(
      new Error('Native connection failed'),
    );

    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow('Native connection failed');
  });

  it('releases the operation lock after failure', async () => {
    adapter.connect.mockRejectedValueOnce(
      new Error('Native connection failed'),
    );

    await expect(
      service.connect(VPN_ID),
    ).rejects.toThrow('Native connection failed');

    adapter.getStatus
      .mockResolvedValueOnce('disconnected')
      .mockResolvedValue('connected');

    await expect(
      service.connect(VPN_ID),
    ).resolves.toMatchObject({
      status: 'connected',
      changed: true,
    });
  });
});
