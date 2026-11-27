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
};

contextBridge.exposeInMainWorld('api', api);
