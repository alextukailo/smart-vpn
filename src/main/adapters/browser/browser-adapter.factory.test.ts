import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type ICommandExecutor,
} from '../../lib/command';

import {
  MacOSChromeAdapter,
} from './macos/macos-chrome.adapter';

import {
  createBrowserAdapter,
} from './browser-adapter.factory';

const executor: ICommandExecutor = {
  execute: vi.fn<ICommandExecutor['execute']>(),
};

describe('createBrowserAdapter', () => {
  it('creates a macOS Chrome adapter', () => {
    expect(
      createBrowserAdapter(
        'chrome',
        'darwin',
        executor,
      ),
    ).toBeInstanceOf(
      MacOSChromeAdapter,
    );
  });

  it('rejects Chrome on unsupported platforms', () => {
    expect(
      () => createBrowserAdapter(
        'chrome',
        'win32',
        executor,
      ),
    ).toThrow(
      'Browser chrome is not supported on win32',
    );
  });

  it('rejects browsers that are not implemented', () => {
    expect(
      () => createBrowserAdapter(
        'safari',
        'darwin',
        executor,
      ),
    ).toThrow(
      'Browser safari is not supported on darwin',
    );
  });
});
