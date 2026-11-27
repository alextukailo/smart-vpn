
import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../shared/constants/ipc';
import { type AppSettings } from '../../shared/types';

import { type SettingsService } from '../services/settings';

import { validateSender } from './validate-sender';

import {
  validateVpnId,
  validateDomainId,
  validateCreateDomainInput,
  validateUpdateDomainInput,
} from './validate-arguments';

export const registerSettingsIpc = (
  settingsService: SettingsService,
): void => {
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.GET,
    async (event): Promise<AppSettings> => {
      validateSender(event);

      return settingsService.get();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.SET_PRIMARY_VPN,
    async (
      event,
      value: unknown,
    ): Promise<AppSettings> => {
      validateSender(event);

      const id = value === null
        ? null
        : validateVpnId(value);

      return settingsService.setPrimaryVpn(id);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.ADD_DOMAIN,
    async (
      event,
      value: unknown,
    ): Promise<AppSettings> => {
      validateSender(event);

      const input = validateCreateDomainInput(value);

      return settingsService.addDomain(input);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.UPDATE_DOMAIN,
    async (
      event,
      value: unknown,
    ): Promise<AppSettings> => {
      validateSender(event);

      const input = validateUpdateDomainInput(value);

      return settingsService.updateDomain(input);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS.REMOVE_DOMAIN,
    async (
      event,
      value: unknown,
    ): Promise<AppSettings> => {
      validateSender(event);

      const id = validateDomainId(value);

      return settingsService.removeDomain(id);
    },
  );
};

export const unregisterSettingsIpc = (): void => {
  for (const channel of Object.values(IPC_CHANNELS.SETTINGS)) {
    ipcMain.removeHandler(channel);
  }
};
