
import {
  type BrowserMonitoringSnapshot,
} from '../../../shared/types';

import {
  matchDomainRules,
} from '../../../shared/lib/browser';

import {
  type IBrowserAdapter,
} from '../../adapters/browser';

import {
  type SettingsService,
} from '../settings';

export class BrowserService {
  private pendingScan:
    Promise<BrowserMonitoringSnapshot> | null = null;

  constructor(
    private readonly adapter: IBrowserAdapter,
    private readonly settingsService: Pick<SettingsService, 'get'>,
  ) {}

  scan(): Promise<BrowserMonitoringSnapshot> {
    if (this.pendingScan !== null) {
      return this.pendingScan;
    }

    this.pendingScan = this.performScan()
      .finally(() => {
        this.pendingScan = null;
      });

    return this.pendingScan;
  }

  private async performScan(): Promise<BrowserMonitoringSnapshot> {
    const result = await this.adapter.scan();

    const settings = await this.settingsService.get();

    const matches = matchDomainRules(
      result.domains,
      settings.domains,
    );

    return {
      browser: result.browser,
      status: result.status,

      matchedRuleIds: matches.matchedRuleIds,
      matchedDomains: matches.matchedDomains,

      checkedAt: new Date().toISOString(),
    };
  }
}
