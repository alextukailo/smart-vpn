
import {
  contextBridge,
  ipcRenderer,
} from 'electron';

import { IPC_CHANNELS } from '../shared/constants/ipc';
import { type SmartVpnApi } from '../shared/types';

const api: SmartVpnApi = {
  system: {
    getInfo: () => ipcRenderer.invoke(
      IPC_CHANNELS.SYSTEM.GET_INFO,
    ),
  },

  vpn: {
    list: () => ipcRenderer.invoke(
      IPC_CHANNELS.VPN.LIST,
    ),

    getStatus: (id) => ipcRenderer.invoke(
      IPC_CHANNELS.VPN.GET_STATUS,
      id,
    ),

    connect: (id) => ipcRenderer.invoke(
      IPC_CHANNELS.VPN.CONNECT,
      id,
    ),

    disconnect: (id) => ipcRenderer.invoke(
      IPC_CHANNELS.VPN.DISCONNECT,
      id,
    ),
  },
};

contextBridge.exposeInMainWorld('api', api);
