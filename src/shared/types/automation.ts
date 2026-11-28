export type AutomationStatus =
  | 'disabled'
  | 'idle'
  | 'waiting-for-vpn'
  | 'connecting'
  | 'connected'
  | 'blocked'
  | 'suspended'
  | 'error';

export type ConnectionOwnership =
  | 'none'
  | 'automation'
  | 'external';

export interface AutomationState {
  status: AutomationStatus;
  ownership: ConnectionOwnership;
  primaryVpnId: string | null;
  ownedVpnId: string | null;
  matchedDomainCount: number;
  error: string | null;
  updatedAt: string | null;
}
