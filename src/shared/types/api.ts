import { type PlatformInfo } from './platform';

export interface SmartVpnApi {
  system: {
    getInfo: () => Promise<PlatformInfo>;
  };
}
