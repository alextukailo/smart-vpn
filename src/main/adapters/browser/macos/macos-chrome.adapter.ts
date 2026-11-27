
import {
  type BrowserScanResult,
} from '../../../../shared/types';

import {
  type ICommandExecutor,
} from '../../../lib/command';

import {
  type IBrowserAdapter,
} from '../browser-adapter.interface';

import { CHROME_SCAN_SCRIPT } from './chrome.script';
import { parseChromeScan } from './chrome.parser';

const OSASCRIPT_PATH = '/usr/bin/osascript';

const SCAN_TIMEOUT = 10_000;

const SCAN_MAX_BUFFER = 1024 * 1024;

export class MacOSChromeAdapter implements IBrowserAdapter {
  readonly id = 'chrome' as const;

  constructor(
    private readonly executor: ICommandExecutor,
  ) {}

  async scan(): Promise<BrowserScanResult> {
    let output: string;

    try {
      const result = await this.executor.execute(
        OSASCRIPT_PATH,
        [
          '-e',
          CHROME_SCAN_SCRIPT,
        ],
        {
          timeout: SCAN_TIMEOUT,
          maxBuffer: SCAN_MAX_BUFFER,
        },
      );

      output = result.stdout;
    } catch {
      throw new Error(
        'Unable to read Chrome tabs. Check macOS Automation permissions.',
      );
    }

    return parseChromeScan(output);
  }
}
