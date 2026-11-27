import { join } from 'node:path';

import { createVpnAdapter } from '../adapters/vpn';

import {
  JsonSettingsRepository,
} from '../repositories/settings';

import { VpnService } from '../services/vpn';
import { SettingsService } from '../services/settings';

export interface ApplicationServices {
  getVpnService: () => VpnService;
  settings: SettingsService;
}

export const createApplicationServices = (
  userDataPath: string,
): ApplicationServices => {
  let vpnService: VpnService | null = null;

  const getVpnService = (): VpnService => {
    if (vpnService === null) {
      vpnService = new VpnService(
        createVpnAdapter(),
      );
    }

    return vpnService;
  };

  const settingsRepository = new JsonSettingsRepository(
    join(userDataPath, 'settings.json'),
  );

  const settingsService = new SettingsService(
    settingsRepository,
    {
      list: () => getVpnService().list(),
    },
  );

  return {
    getVpnService,
    settings: settingsService,
  };
};
