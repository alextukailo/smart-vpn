import { type AppSettings } from '../../types';

export const createDefaultSettings = (): AppSettings => ({
  version: 1,

  primaryVpnId: null,

  domains: [],

  automation: {
    enabled: false,
    autoDisconnect: true,
    disconnectDelaySeconds: 30,
    pollingIntervalSeconds: 3,
  },
});
