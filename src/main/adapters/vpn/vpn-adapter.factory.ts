import {
  CommandExecutor,
  type ICommandExecutor,
} from '../../lib/command';

import {
  type IVpnAdapter,
} from './vpn-adapter.interface';

import {
  MacOSVpnAdapter,
} from './macos/macos-vpn.adapter';

export const createVpnAdapter = (
  platform: NodeJS.Platform = process.platform,
  executor: ICommandExecutor = new CommandExecutor(),
): IVpnAdapter => {
  switch (platform) {
    case 'darwin':
      return new MacOSVpnAdapter(executor);

    case 'win32':
      throw new Error(
        'Windows VPN adapter is not implemented yet',
      );

    default:
      throw new Error(
        `Unsupported operating system: ${platform}`,
      );
  }
};
