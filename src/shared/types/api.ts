import { type PlatformInfo } from './platform';

import {
  type VpnConnection,
  type VpnStatus,
  type VpnOperationResult,
} from './vpn';

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
}
