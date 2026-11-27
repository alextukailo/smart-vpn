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
