
import {
  type CreateDomainRuleInput,
  type UpdateDomainRuleInput,
} from '../../shared/types';

const containsControlCharacters = (
  value: string,
): boolean => {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);

    return code <= 31 || code === 127;
  });
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const validateIdentifier = (
  value: unknown,
  errorMessage: string,
): string => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 256 ||
    value.trim() !== value ||
    containsControlCharacters(value)
  ) {
    throw new Error(errorMessage);
  }

  return value;
};

export const validateVpnId = (
  value: unknown,
): string => {
  return validateIdentifier(
    value,
    'Invalid VPN identifier',
  );
};

export const validateDomainId = (
  value: unknown,
): string => {
  return validateIdentifier(
    value,
    'Invalid domain identifier',
  );
};

export const validateCreateDomainInput = (
  value: unknown,
): CreateDomainRuleInput => {
  if (
    !isRecord(value) ||
    typeof value.domain !== 'string' ||
    value.domain.trim().length === 0 ||
    value.domain.length > 2_048 ||
    containsControlCharacters(value.domain) ||
    typeof value.includeSubdomains !== 'boolean'
  ) {
    throw new Error('Invalid domain input');
  }

  return {
    domain: value.domain,
    includeSubdomains: value.includeSubdomains,
  };
};

export const validateUpdateDomainInput = (
  value: unknown,
): UpdateDomainRuleInput => {
  if (
    !isRecord(value) ||
    typeof value.enabled !== 'boolean'
  ) {
    throw new Error('Invalid domain update input');
  }

  return {
    ...validateCreateDomainInput(value),

    id: validateDomainId(value.id),

    enabled: value.enabled,
  };
};
