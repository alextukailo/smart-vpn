
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  normalizeDomain,
  matchesDomain,
} from './domain';

describe('normalizeDomain', () => {
  it.each([
    ['chatgpt.com', 'chatgpt.com'],
    ['CHATGPT.COM', 'chatgpt.com'],
    ['  chatgpt.com  ', 'chatgpt.com'],
    ['https://chatgpt.com', 'chatgpt.com'],
    ['http://chatgpt.com', 'chatgpt.com'],
    ['https://chatgpt.com/c/123', 'chatgpt.com'],
    ['https://chatgpt.com?foo=bar', 'chatgpt.com'],
    ['https://chatgpt.com#section', 'chatgpt.com'],
    ['youtube.com:443', 'youtube.com'],
    ['www.youtube.com', 'www.youtube.com'],
    ['example.com.', 'example.com'],
    ['bücher.de', 'xn--bcher-kva.de'],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    'invalid domain',
    'localhost',
    '192.168.1.1',
    'chrome://settings',
    'about:blank',
    'file:///Users/example/document.html',
    'ftp://example.com',
    'https://',
    '*.example.com',
    'https://example.com@evil.com',
  ])('rejects invalid input "%s"', (input) => {
    expect(normalizeDomain(input)).toBeNull();
  });
});

describe('matchesDomain', () => {
  it('matches an exact domain', () => {
    expect(
      matchesDomain(
        'https://chatgpt.com',
        'chatgpt.com',
      ),
    ).toBe(true);
  });

  it('matches a domain with a path and query', () => {
    expect(
      matchesDomain(
        'https://chatgpt.com/c/123?foo=bar',
        'chatgpt.com',
      ),
    ).toBe(true);
  });

  it('matches a subdomain by default', () => {
    expect(
      matchesDomain(
        'https://www.youtube.com',
        'youtube.com',
      ),
    ).toBe(true);
  });

  it('matches nested subdomains', () => {
    expect(
      matchesDomain(
        'https://a.b.youtube.com',
        'youtube.com',
      ),
    ).toBe(true);
  });

  it('does not match subdomains when disabled', () => {
    expect(
      matchesDomain(
        'https://www.youtube.com',
        'youtube.com',
        false,
      ),
    ).toBe(false);
  });

  it('matches exact domains when subdomains are disabled', () => {
    expect(
      matchesDomain(
        'https://youtube.com',
        'youtube.com',
        false,
      ),
    ).toBe(true);
  });

  it('does not match misleading domain suffixes', () => {
    expect(
      matchesDomain(
        'https://fakeyoutube.com',
        'youtube.com',
      ),
    ).toBe(false);
  });

  it('does not match misleading domain prefixes', () => {
    expect(
      matchesDomain(
        'https://youtube.com.example.org',
        'youtube.com',
      ),
    ).toBe(false);
  });

  it('ignores domain names inside URL paths', () => {
    expect(
      matchesDomain(
        'https://example.org/youtube.com',
        'youtube.com',
      ),
    ).toBe(false);
  });

  it('performs case-insensitive matching', () => {
    expect(
      matchesDomain(
        'https://YOUTUBE.COM',
        'YouTube.com',
      ),
    ).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(
      matchesDomain(
        'chrome://settings',
        'youtube.com',
      ),
    ).toBe(false);
  });

  it('returns false for invalid domain rules', () => {
    expect(
      matchesDomain(
        'https://youtube.com',
        '',
      ),
    ).toBe(false);
  });
});
