import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../shared/constants/ipc';

import {
  type BrowserMonitoringState,
} from '../../shared/types';

import {
  type BrowserMonitoringService,
} from '../services/monitoring';

import { validateSender } from './validate-sender';

export const registerMonitoringIpc = (
  monitoringService: BrowserMonitoringService,
): void => {
  ipcMain.handle(
    IPC_CHANNELS.MONITORING.GET_STATE,
    (event): BrowserMonitoringState => {
      validateSender(event);

      return monitoringService.getState();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.MONITORING.START,
    (event): BrowserMonitoringState => {
      validateSender(event);

      if (process.platform !== 'darwin') {
        throw new Error(
          'Browser monitoring is currently supported only on macOS',
        );
      }

      return monitoringService.start();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.MONITORING.STOP,
    (event): BrowserMonitoringState => {
      validateSender(event);

      return monitoringService.stop();
    },
  );
};

export const unregisterMonitoringIpc = (): void => {
  for (const channel of Object.values(IPC_CHANNELS.MONITORING)) {
    ipcMain.removeHandler(channel);
  }
};
