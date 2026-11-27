
export interface DomainRule {
  id: string;
  domain: string;
  enabled: boolean;
  includeSubdomains: boolean;
}

export interface CreateDomainRuleInput {
  domain: string;
  includeSubdomains: boolean;
}

export interface UpdateDomainRuleInput {
  id: string;
  domain: string;
  enabled: boolean;
  includeSubdomains: boolean;
}

export interface AutomationSettings {
  enabled: boolean;
  autoDisconnect: boolean;
  disconnectDelaySeconds: number;
  pollingIntervalSeconds: number;
}

export interface AppSettings {
  version: 1;
  primaryVpnId: string | null;
  domains: DomainRule[];
  automation: AutomationSettings;
}
