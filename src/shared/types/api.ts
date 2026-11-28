
import { type PlatformInfo } from './platform';

import {
  type AppSettings,
  type CreateDomainRuleInput,
  type UpdateDomainRuleInput,
} from './settings';

import {
  type VpnConnection,
  type VpnStatus,
  type VpnOperationResult,
} from './vpn';

import {
  type BrowserMonitoringState,
} from './browser';

export interface SmartVpnApi {
  system: {
    getInfo: () => Promise<PlatformInfo>;
  };

  vpn: {
    list: () => Promise<VpnConnection[]>;
    getStatus: (id: string) => Promise<VpnStatus>;
    connect: (id: string) => Promise<VpnOperationResult>;
    disconnect: (id: string) => Promise<VpnOperationResult>;
  };

  settings: {
    get: () => Promise<AppSettings>;

    setPrimaryVpn: (
      id: string | null,
    ) => Promise<AppSettings>;

    addDomain: (
      input: CreateDomainRuleInput,
    ) => Promise<AppSettings>;

    updateDomain: (
      input: UpdateDomainRuleInput,
    ) => Promise<AppSettings>;

    removeDomain: (
      id: string,
    ) => Promise<AppSettings>;
  };

  monitoring: {
    getState: () => Promise<BrowserMonitoringState>;
    start: () => Promise<BrowserMonitoringState>;
    stop: () => Promise<BrowserMonitoringState>;
  };
}
