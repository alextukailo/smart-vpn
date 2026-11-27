import { type BrowserId } from '../../../shared/types';

import {
  CommandExecutor,
  type ICommandExecutor,
} from '../../lib/command';

import {
  type IBrowserAdapter,
} from './browser-adapter.interface';

import {
  MacOSChromeAdapter,
} from './macos/macos-chrome.adapter';

export const createBrowserAdapter = (
  browser: BrowserId = 'chrome',
  platform: NodeJS.Platform = process.platform,
  executor: ICommandExecutor = new CommandExecutor(),
): IBrowserAdapter => {
  if (
    platform === 'darwin' &&
    browser === 'chrome'
  ) {
    return new MacOSChromeAdapter(executor);
  }

  throw new Error(
    `Browser ${browser} is not supported on ${platform}`,
  );
};
