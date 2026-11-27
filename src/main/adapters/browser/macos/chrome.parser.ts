
import {
  type BrowserScanResult,
} from '../../../../shared/types';

import {
  normalizeDomain,
} from '../../../../shared/lib/domain';

const RUNNING_MARKER = 'RUNNING';
const NOT_RUNNING_MARKER = 'NOT_RUNNING';

const extractDomain = (
  value: string,
): string | null => {
  try {
    const url = new URL(value.trim());

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      return null;
    }

    return normalizeDomain(
      url.hostname,
    ) || null;
  } catch {
    return null;
  }
};

export const parseChromeScan = (
  output: string,
): BrowserScanResult => {
  const [
    marker,
    ...urls
  ] = output.trim().split(/\r?\n/);

  if (marker === NOT_RUNNING_MARKER) {
    if (urls.length > 0) {
      throw new Error('Invalid Chrome scan response');
    }

    return {
      browser: 'chrome',
      status: 'not-running',
      domains: [],
    };
  }

  if (marker !== RUNNING_MARKER) {
    throw new Error('Invalid Chrome scan response');
  }

  const domains = new Set<string>();

  for (const url of urls) {
    const domain = extractDomain(url);

    if (domain !== null) {
      domains.add(domain);
    }
  }

  return {
    browser: 'chrome',
    status: 'running',
    domains: Array.from(domains),
  };
};
