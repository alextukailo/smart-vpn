
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type ICommandExecutor,
} from '../../../lib/command';

import { CHROME_SCAN_SCRIPT } from './chrome.script';

import {
  MacOSChromeAdapter,
} from './macos-chrome.adapter';

describe('MacOSChromeAdapter', () => {
  const execute =
    vi.fn<ICommandExecutor['execute']>();

  const executor: ICommandExecutor = {
    execute,
  };

  const adapter = new MacOSChromeAdapter(
    executor,
  );

  beforeEach(() => {
    execute.mockReset();

    execute.mockResolvedValue({
      stdout: 'RUNNING',
      stderr: '',
    });
  });

  it('has the correct browser identifier', () => {
    expect(adapter.id).toBe('chrome');
  });

  it('executes AppleScript using an absolute executable path', async () => {
    await adapter.scan();

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      '/usr/bin/osascript',
      [
        '-e',
        CHROME_SCAN_SCRIPT,
      ],
      {
        timeout: 10_000,
        maxBuffer: 1024 * 1024,
      },
    );
  });

  it('returns domains from running Chrome tabs', async () => {
    execute.mockResolvedValue({
      stdout: 'RUNNING\nhttps://example.com',
      stderr: '',
    });

    await expect(
      adapter.scan(),
    ).resolves.toEqual({
      browser: 'chrome',
      status: 'running',
      domains: [
        'example.com',
      ],
    });
  });

  it('detects when Chrome is not running', async () => {
    execute.mockResolvedValue({
      stdout: 'NOT_RUNNING',
      stderr: '',
    });

    await expect(
      adapter.scan(),
    ).resolves.toEqual({
      browser: 'chrome',
      status: 'not-running',
      domains: [],
    });
  });

  it('rejects failed native commands', async () => {
    execute.mockRejectedValue(
      new Error('AppleScript execution failed'),
    );

    await expect(
      adapter.scan(),
    ).rejects.toThrow(
      'Unable to read Chrome tabs',
    );
  });

  it('does not expose private URLs from command errors', async () => {
    execute.mockRejectedValue(
      new Error(
        'Failed reading https://example.com?token=private',
      ),
    );

    await expect(
      adapter.scan(),
    ).rejects.toThrow(
      /^Unable to read Chrome tabs. Check macOS Automation permissions\.$/,
    );
  });

  it('rejects malformed native output', async () => {
    execute.mockResolvedValue({
      stdout: 'Unexpected output',
      stderr: '',
    });

    await expect(
      adapter.scan(),
    ).rejects.toThrow(
      'Invalid Chrome scan response',
    );
  });
});
