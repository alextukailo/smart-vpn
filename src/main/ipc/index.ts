import {
  registerSystemIpc,
  unregisterSystemIpc,
} from './system.ipc';

export const registerIpcHandlers = (): void => {
  registerSystemIpc();
};

export const unregisterIpcHandlers = (): void => {
  unregisterSystemIpc();
};
