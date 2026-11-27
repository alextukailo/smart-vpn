
const HTTP_PROTOCOLS = new Set([
  'http:',
  'https:',
]);

const DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const normalizeDomain = (
  value: string,
): string | null => {
  const input = value.trim();

  if (!input || /\s/.test(input)) {
    return null;
  }

  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(input);

  const candidate = hasProtocol
    ? input
    : `https://${input}`;

  try {
    const url = new URL(candidate);

    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    if (url.username || url.password) {
      return null;
    }

    const hostname = url.hostname
      .toLowerCase()
      .replace(/\.$/, '');

    if (
      hostname.length > 253 ||
      !DOMAIN_PATTERN.test(hostname) ||
      /^\d+(?:\.\d+){3}$/.test(hostname)
    ) {
      return null;
    }

    return hostname;
  } catch {
    return null;
  }
};

export const matchesDomain = (
  url: string,
  domain: string,
  includeSubdomains = true,
): boolean => {
  const hostname = normalizeDomain(url);
  const target = normalizeDomain(domain);

  if (!hostname || !target) {
    return false;
  }

  if (hostname === target) {
    return true;
  }

  return (
    includeSubdomains &&
    hostname.endsWith(`.${target}`)
  );
};
