import { app, ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../shared/constants/ipc';
import { type PlatformInfo } from '../../shared/types';

import { validateSender } from './validate-sender';

export const registerSystemIpc = (): void => {
  ipcMain.handle(
    IPC_CHANNELS.SYSTEM.GET_INFO,
    (event): PlatformInfo => {
      validateSender(event);

      return {
        platform: process.platform,
        architecture: process.arch,
        supported: ['darwin', 'win32'].includes(
          process.platform,
        ),
        appVersion: app.getVersion(),
      };
    },
  );
};

export const unregisterSystemIpc = (): void => {
  ipcMain.removeHandler(
    IPC_CHANNELS.SYSTEM.GET_INFO,
  );
};
