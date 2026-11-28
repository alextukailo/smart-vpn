
import { join } from 'node:path';

import { createVpnAdapter } from '../adapters/vpn';
import { createBrowserAdapter } from '../adapters/browser';

import {
  JsonSettingsRepository,
} from '../repositories/settings';

import { VpnService } from '../services/vpn';
import { SettingsService } from '../services/settings';
import { BrowserService } from '../services/browser';

import {
  BrowserMonitoringService,
} from '../services/monitoring';

export interface ApplicationServices {
  getVpnService: () => VpnService;
  settings: SettingsService;
  monitoring: BrowserMonitoringService;
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

  const browserService = new BrowserService(
    {
      id: 'chrome',

      scan: async () => {
        const adapter = createBrowserAdapter();

        return adapter.scan();
      },
    },
    settingsService,
  );

  const monitoringService = new BrowserMonitoringService(
    browserService,
    settingsService,
  );

  return {
    getVpnService,
    settings: settingsService,
    monitoring: monitoringService,
  };
};
