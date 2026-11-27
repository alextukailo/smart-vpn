import { type SmartVpnApi } from '../shared/types';

declare global {
  interface Window {
    api: SmartVpnApi;
  }
}

export {};
