import {
  type SmartVpnApi,
  type BrowserMonitoringState,
  type BrowserMonitoringSnapshot,
} from '@shared/types';

export const createMonitoringMock = (
  snapshot: BrowserMonitoringSnapshot = {
    browser: 'chrome',
    status: 'running',
    matchedRuleIds: [],
    matchedDomains: [],
    checkedAt: '2026-01-01T12:00:00.000Z',
  },
): SmartVpnApi['monitoring'] => {
  let state: BrowserMonitoringState = {
    status: 'stopped',
    snapshot: null,
    error: null,
    pollingIntervalSeconds: 3,
  };

  return {
    getState: () => Promise.resolve(
      structuredClone(state),
    ),

    start: () => {
      state = {
        ...state,
        status: 'running',
        snapshot: structuredClone(snapshot),
        error: null,
      };

      return Promise.resolve(
        structuredClone(state),
      );
    },

    stop: () => {
      state = {
        ...state,
        status: 'stopped',
        snapshot: null,
        error: null,
      };

      return Promise.resolve(
        structuredClone(state),
      );
    },
  };
};
