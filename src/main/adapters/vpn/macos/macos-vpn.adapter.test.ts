
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type ICommandExecutor,
} from '../../../lib/command';

import {
  MacOSVpnAdapter,
} from './macos-vpn.adapter';

const VPN_ID = '75E5324F-E2B8-40C5-8C6B-F02E4ACCB4E9';

describe('MacOSVpnAdapter', () => {
  const execute = vi.fn<ICommandExecutor['execute']>();

  const executor: ICommandExecutor = {
    execute,
  };

  const adapter = new MacOSVpnAdapter(executor);

  beforeEach(() => {
    execute.mockReset();

    execute.mockResolvedValue({
      stdout: '',
      stderr: '',
    });
  });

  it('lists available VPN connections', async () => {
    execute.mockResolvedValue({
      stdout: `* (Connected) ${VPN_ID} VPN "Test VPN" [VPN:test]`,
      stderr: '',
    });

    const connections = await adapter.list();

    expect(execute).toHaveBeenCalledWith(
      '/usr/sbin/scutil',
      ['--nc', 'list'],
    );

    expect(connections).toEqual([
      {
        id: VPN_ID,
        name: 'Test VPN',
        protocol: 'VPN:test',
        status: 'connected',
        enabled: true,
      },
    ]);
  });

  it('retrieves the VPN status', async () => {
    execute.mockResolvedValue({
      stdout: 'Connected\nExtended Status <dictionary> {}',
      stderr: '',
    });

    await expect(
      adapter.getStatus(VPN_ID),
    ).resolves.toBe('connected');

    expect(execute).toHaveBeenCalledWith(
      '/usr/sbin/scutil',
      ['--nc', 'status', VPN_ID],
    );
  });

  it('starts a VPN connection', async () => {
    await adapter.connect(VPN_ID);

    expect(execute).toHaveBeenCalledWith(
      '/usr/sbin/scutil',
      ['--nc', 'start', VPN_ID],
    );
  });

  it('stops a VPN connection', async () => {
    await adapter.disconnect(VPN_ID);

    expect(execute).toHaveBeenCalledWith(
      '/usr/sbin/scutil',
      ['--nc', 'stop', VPN_ID],
    );
  });

  it('rejects an invalid identifier when connecting', async () => {
    await expect(
      adapter.connect('invalid-id'),
    ).rejects.toThrow('Invalid VPN connection identifier');

    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects an invalid identifier when disconnecting', async () => {
    await expect(
      adapter.disconnect('--help'),
    ).rejects.toThrow('Invalid VPN connection identifier');

    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects an invalid identifier when retrieving status', async () => {
    await expect(
      adapter.getStatus(''),
    ).rejects.toThrow('Invalid VPN connection identifier');

    expect(execute).not.toHaveBeenCalled();
  });

  it('propagates command execution errors', async () => {
    execute.mockRejectedValue(
      new Error('Connection failed'),
    );

    await expect(
      adapter.connect(VPN_ID),
    ).rejects.toThrow('Connection failed');
  });

  it('propagates VPN discovery errors', async () => {
    execute.mockRejectedValue(
      new Error('Command failed'),
    );

    await expect(
      adapter.list(),
    ).rejects.toThrow('Command failed');
  });
});
