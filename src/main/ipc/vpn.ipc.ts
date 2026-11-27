
import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../shared/constants/ipc';

import {
  type VpnConnection,
  type VpnStatus,
  type VpnOperationResult,
} from '../../shared/types';

import { createVpnAdapter } from '../adapters/vpn';
import { VpnService } from '../services/vpn';

import { validateSender } from './validate-sender';
import { validateVpnId } from './validate-arguments';

let vpnService: VpnService | null = null;

const getVpnService = (): VpnService => {
  if (!vpnService) {
    vpnService = new VpnService(
      createVpnAdapter(),
    );
  }

  return vpnService;
};

export const registerVpnIpc = (): void => {
  ipcMain.handle(
    IPC_CHANNELS.VPN.LIST,
    async (event): Promise<VpnConnection[]> => {
      validateSender(event);

      return getVpnService().list();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.VPN.GET_STATUS,
    async (
      event,
      value: unknown,
    ): Promise<VpnStatus> => {
      validateSender(event);

      const id = validateVpnId(value);

      return getVpnService().getStatus(id);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.VPN.CONNECT,
    async (
      event,
      value: unknown,
    ): Promise<VpnOperationResult> => {
      validateSender(event);

      const id = validateVpnId(value);

      return getVpnService().connect(id);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.VPN.DISCONNECT,
    async (
      event,
      value: unknown,
    ): Promise<VpnOperationResult> => {
      validateSender(event);

      const id = validateVpnId(value);

      return getVpnService().disconnect(id);
    },
  );
};

export const unregisterVpnIpc = (): void => {
  const channels = Object.values(
    IPC_CHANNELS.VPN,
  );

  for (const channel of channels) {
    ipcMain.removeHandler(channel);
  }
};
