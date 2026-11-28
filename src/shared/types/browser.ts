export type BrowserId =
  | 'chrome'
  | 'safari'
  | 'edge'
  | 'firefox';

export type BrowserScanStatus =
  | 'running'
  | 'not-running';

export interface BrowserScanResult {
  browser: BrowserId;
  status: BrowserScanStatus;
  domains: string[];
}

export interface BrowserMonitoringSnapshot {
  browser: BrowserId;
  status: BrowserScanStatus;
  matchedRuleIds: string[];
  matchedDomains: string[];
  checkedAt: string;
}

export type MonitoringStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'error';

export interface BrowserMonitoringState {
  status: MonitoringStatus;
  snapshot: BrowserMonitoringSnapshot | null;
  error: string | null;
  pollingIntervalSeconds: number;
}
