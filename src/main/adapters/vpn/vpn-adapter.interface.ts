import {
  type VpnConnection,
  type VpnStatus,
} from '../../../shared/types';

export interface IVpnAdapter {
  list(): Promise<VpnConnection[]>;

  getStatus(id: string): Promise<VpnStatus>;

  connect(id: string): Promise<void>;

  disconnect(id: string): Promise<void>;
}
