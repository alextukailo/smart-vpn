
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

  settings: {
    get: () => ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS.GET,
    ),

    setPrimaryVpn: (id) => ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS.SET_PRIMARY_VPN,
      id,
    ),

    addDomain: (input) => ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS.ADD_DOMAIN,
      input,
    ),

    updateDomain: (input) => ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS.UPDATE_DOMAIN,
      input,
    ),

    removeDomain: (id) => ipcRenderer.invoke(
      IPC_CHANNELS.SETTINGS.REMOVE_DOMAIN,
      id,
    ),
  },
};

contextBridge.exposeInMainWorld('api', api);
