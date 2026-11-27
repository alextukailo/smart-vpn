export type VpnStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'disconnecting'
  | 'unknown';

export interface VpnConnection {
  id: string;
  name: string;
  protocol: string;
  status: VpnStatus;
  enabled: boolean;
}
