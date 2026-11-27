import {
  type VpnConnection,
  type VpnStatus,
  type VpnOperationResult,
} from '@shared/types';

export const vpnApi = {
  list: (): Promise<VpnConnection[]> => {
    return window.api.vpn.list();
  },

  getStatus: (id: string): Promise<VpnStatus> => {
    return window.api.vpn.getStatus(id);
  },

  connect: (id: string): Promise<VpnOperationResult> => {
    return window.api.vpn.connect(id);
  },

  disconnect: (id: string): Promise<VpnOperationResult> => {
    return window.api.vpn.disconnect(id);
  },
};
