
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

import {
  registerMonitoringIpc,
  unregisterMonitoringIpc,
} from './monitoring.ipc';

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

  registerMonitoringIpc(
    services.monitoring,
  );
};

export const unregisterIpcHandlers = (): void => {
  unregisterSystemIpc();
  unregisterVpnIpc();
  unregisterSettingsIpc();
  unregisterMonitoringIpc();
};
