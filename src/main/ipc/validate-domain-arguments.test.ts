
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  validateDomainId,
  validateCreateDomainInput,
  validateUpdateDomainInput,
} from './validate-arguments';

const validInput = {
  domain: 'example.com',
  includeSubdomains: true,
};

describe('Domain IPC argument validation', () => {
  it('accepts valid creation input', () => {
    expect(
      validateCreateDomainInput(validInput),
    ).toEqual(validInput);
  });

  it('discards unexpected properties', () => {
    expect(
      validateCreateDomainInput({
        ...validInput,
        id: 'unexpected',
        enabled: false,
        version: 999,
      }),
    ).toEqual(validInput);
  });

  it.each([
    null,
    undefined,
    {},
    [],
    'example.com',
    {
      domain: '',
      includeSubdomains: true,
    },
    {
      domain: '   ',
      includeSubdomains: true,
    },
    {
      domain: 'example.com',
      includeSubdomains: 'true',
    },
    {
      domain: 'example\n.com',
      includeSubdomains: true,
    },
    {
      domain: 'a'.repeat(2049),
      includeSubdomains: true,
    },
  ])('rejects invalid creation input: %s', (value) => {
    expect(
      () => validateCreateDomainInput(value),
    ).toThrow('Invalid domain input');
  });

  it('accepts valid update input', () => {
    const input = {
      ...validInput,
      id: 'domain-1',
      enabled: false,
    };

    expect(
      validateUpdateDomainInput(input),
    ).toEqual(input);
  });

  it('rejects update input without an identifier', () => {
    expect(
      () => validateUpdateDomainInput({
        ...validInput,
        enabled: true,
      }),
    ).toThrow('Invalid domain identifier');
  });

  it('rejects non-boolean enabled values', () => {
    expect(
      () => validateUpdateDomainInput({
        ...validInput,
        id: 'domain-1',
        enabled: 'false',
      }),
    ).toThrow('Invalid domain update input');
  });

  it('accepts a valid domain identifier', () => {
    expect(
      validateDomainId('domain-1'),
    ).toBe('domain-1');
  });

  it.each([
    '',
    null,
    undefined,
    123,
    ' invalid',
    'invalid\nid',
  ])('rejects invalid domain identifier: %s', (value) => {
    expect(
      () => validateDomainId(value),
    ).toThrow('Invalid domain identifier');
  });
});
