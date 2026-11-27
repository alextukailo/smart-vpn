
import {
  type ApplicationServices,
} from '../application';

import {
  registerSystemIpc,
  unregisterSystemIpc,
} from './system.ipc';

import {
  registerVpnIpc,
  unregisterVpnIpc,
} from './vpn.ipc';

import {
  registerSettingsIpc,
  unregisterSettingsIpc,
} from './settings.ipc';

export const registerIpcHandlers = (
  services: ApplicationServices,
): void => {
  registerSystemIpc();

  registerVpnIpc(
    services.getVpnService,
  );

  registerSettingsIpc(
    services.settings,
  );
};

export const unregisterIpcHandlers = (): void => {
  unregisterSystemIpc();
  unregisterVpnIpc();
  unregisterSettingsIpc();
};
