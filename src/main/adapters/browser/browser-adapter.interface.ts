import {
  type BrowserId,
  type BrowserScanResult,
} from '../../../shared/types';

export interface IBrowserAdapter {
  readonly id: BrowserId;

  scan(): Promise<BrowserScanResult>;
}
