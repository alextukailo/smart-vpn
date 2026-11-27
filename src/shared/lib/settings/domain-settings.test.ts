
import {
  describe,
  expect,
  it,
} from 'vitest';

import { type DomainRule } from '../../types';

import { createDefaultSettings } from './default-settings';
import { isValidSettings } from './validate-settings';

const rule: DomainRule = {
  id: 'domain-1',
  domain: 'example.com',
  enabled: true,
  includeSubdomains: true,
};

describe('Domain settings validation', () => {
  it('rejects duplicate domain identifiers', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),

        domains: [
          rule,
          {
            ...rule,
            domain: 'another.com',
          },
        ],
      }),
    ).toBe(false);
  });

  it('rejects duplicate domains', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),

        domains: [
          rule,
          {
            ...rule,
            id: 'domain-2',
          },
        ],
      }),
    ).toBe(false);
  });

  it('accepts unique domain rules', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),

        domains: [
          rule,
          {
            ...rule,
            id: 'domain-2',
            domain: 'another.com',
          },
        ],
      }),
    ).toBe(true);
  });

  it('accepts disabled domain rules', () => {
    expect(
      isValidSettings({
        ...createDefaultSettings(),

        domains: [
          {
            ...rule,
            enabled: false,
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects more than 1000 domain rules', () => {
    const domains = Array.from(
      { length: 1001 },

      (_, index): DomainRule => ({
        ...rule,
        id: `domain-${index}`,
        domain: `example${index}.com`,
      }),
    );

    expect(
      isValidSettings({
        ...createDefaultSettings(),
        domains,
      }),
    ).toBe(false);
  });
});
