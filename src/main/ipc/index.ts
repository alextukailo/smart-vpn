import {
  registerSystemIpc,
  unregisterSystemIpc,
} from './system.ipc';

import {
  registerVpnIpc,
  unregisterVpnIpc,
} from './vpn.ipc';

export const registerIpcHandlers = (): void => {
  registerSystemIpc();
  registerVpnIpc();
};

export const unregisterIpcHandlers = (): void => {
  unregisterSystemIpc();
  unregisterVpnIpc();
};
