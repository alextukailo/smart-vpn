
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseChromeScan,
} from './chrome.parser';

describe('parseChromeScan', () => {
  it('detects a closed browser', () => {
    expect(
      parseChromeScan('NOT_RUNNING'),
    ).toEqual({
      browser: 'chrome',
      status: 'not-running',
      domains: [],
    });
  });

  it('detects a running browser without tabs', () => {
    expect(
      parseChromeScan('RUNNING'),
    ).toEqual({
      browser: 'chrome',
      status: 'running',
      domains: [],
    });
  });

  it('extracts domains from browser URLs', () => {
    const output = [
      'RUNNING',
      'https://example.com/page',
      'https://another.com/path',
    ].join('\n');

    expect(
      parseChromeScan(output),
    ).toEqual({
      browser: 'chrome',
      status: 'running',
      domains: [
        'example.com',
        'another.com',
      ],
    });
  });

  it('removes URL paths and query parameters', () => {
    const output = [
      'RUNNING',
      'https://example.com/account?token=private#section',
    ].join('\n');

    expect(
      parseChromeScan(output).domains,
    ).toEqual([
      'example.com',
    ]);
  });

  it('deduplicates domains', () => {
    const output = [
      'RUNNING',
      'https://example.com/page-1',
      'https://example.com/page-2',
      'http://example.com/',
    ].join('\n');

    expect(
      parseChromeScan(output).domains,
    ).toEqual([
      'example.com',
    ]);
  });

  it('preserves different subdomains', () => {
    const output = [
      'RUNNING',
      'https://example.com',
      'https://www.example.com',
      'https://api.example.com',
    ].join('\n');

    expect(
      parseChromeScan(output).domains,
    ).toEqual([
      'example.com',
      'www.example.com',
      'api.example.com',
    ]);
  });

  it('normalizes uppercase hostnames', () => {
    expect(
      parseChromeScan(
        'RUNNING\nhttps://EXAMPLE.COM',
      ).domains,
    ).toEqual([
      'example.com',
    ]);
  });

  it('supports HTTP websites', () => {
    expect(
      parseChromeScan(
        'RUNNING\nhttp://example.com',
      ).domains,
    ).toEqual([
      'example.com',
    ]);
  });

  it.each([
    'chrome://settings/',
    'chrome://newtab/',
    'chrome-extension://extension-id/page.html',
    'about:blank',
    'file:///tmp/document.pdf',
    'ftp://example.com',
    'data:text/plain,example',
    'invalid-url',
    'https://localhost',
    'http://127.0.0.1',
    '',
  ])('ignores unsupported URL "%s"', (url) => {
    expect(
      parseChromeScan(
        `RUNNING\n${url}`,
      ).domains,
    ).toEqual([]);
  });

  it('handles multiple URL types', () => {
    const output = [
      'RUNNING',
      'chrome://newtab/',
      'https://example.com',
      'about:blank',
      'https://another.com',
    ].join('\n');

    expect(
      parseChromeScan(output).domains,
    ).toEqual([
      'example.com',
      'another.com',
    ]);
  });

  it('supports CRLF line endings', () => {
    const output = [
      'RUNNING',
      'https://example.com',
    ].join('\r\n');

    expect(
      parseChromeScan(output).domains,
    ).toEqual([
      'example.com',
    ]);
  });

  it.each([
    '',
    'Unexpected response',
    'https://example.com',
    'NOT_RUNNING\nhttps://example.com',
  ])('rejects invalid scan response "%s"', (output) => {
    expect(
      () => parseChromeScan(output),
    ).toThrow('Invalid Chrome scan response');
  });
});
