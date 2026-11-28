import {
  type BrowserMonitoringState,
} from '@shared/types';

export const monitoringApi = {
  getState: (): Promise<BrowserMonitoringState> => {
    return window.api.monitoring.getState();
  },

  start: (): Promise<BrowserMonitoringState> => {
    return window.api.monitoring.start();
  },

  stop: (): Promise<BrowserMonitoringState> => {
    return window.api.monitoring.stop();
  },
};
