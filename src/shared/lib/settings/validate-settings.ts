
import { type AppSettings } from '../../types';

import { normalizeDomain } from '../domain';

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isIntegerInRange = (
  value: unknown,
  min: number,
  max: number,
): value is number => {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
};

const isValidIdentifier = (
  value: unknown,
): value is string => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 256 &&
    value.trim() === value &&
    !Array.from(value).some((character) => {
      const code = character.charCodeAt(0);

      return code <= 31 || code === 127;
    })
  );
};

const isValidDomainRule = (
  value: unknown,
): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isValidIdentifier(value.id) &&
    typeof value.domain === 'string' &&
    normalizeDomain(value.domain) === value.domain &&
    typeof value.enabled === 'boolean' &&
    typeof value.includeSubdomains === 'boolean'
  );
};

export const isValidSettings = (
  value: unknown,
): value is AppSettings => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    version,
    primaryVpnId,
    domains,
    automation,
  } = value;

  if (
    version !== 1 ||
    (
      primaryVpnId !== null &&
      !isValidIdentifier(primaryVpnId)
    ) ||
    !Array.isArray(domains) ||
    !domains.every(isValidDomainRule) ||
    !isRecord(automation)
  ) {
    return false;
  }

  return (
    typeof automation.enabled === 'boolean' &&
    typeof automation.autoDisconnect === 'boolean' &&
    isIntegerInRange(
      automation.disconnectDelaySeconds,
      0,
      3_600,
    ) &&
    isIntegerInRange(
      automation.pollingIntervalSeconds,
      1,
      60,
    )
  );
};
