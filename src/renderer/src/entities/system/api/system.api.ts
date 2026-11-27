import { type PlatformInfo } from '@shared/types';

export const getSystemInfo = (): Promise<PlatformInfo> => {
  return window.api.system.getInfo();
};
