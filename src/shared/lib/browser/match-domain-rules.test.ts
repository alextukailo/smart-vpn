
import {
  describe,
  expect,
  it,
} from 'vitest';

import { type DomainRule } from '../../types';

import {
  matchDomainRules,
} from './match-domain-rules';

const exampleRule: DomainRule = {
  id: 'rule-1',
  domain: 'example.com',
  enabled: true,
  includeSubdomains: true,
};

describe('matchDomainRules', () => {
  it('matches an exact hostname', () => {
    expect(
      matchDomainRules(
        ['example.com'],
        [exampleRule],
      ),
    ).toEqual({
      matchedRuleIds: ['rule-1'],
      matchedDomains: ['example.com'],
    });
  });

  it('matches subdomains when enabled', () => {
    expect(
      matchDomainRules(
        ['www.example.com'],
        [exampleRule],
      ),
    ).toEqual({
      matchedRuleIds: ['rule-1'],
      matchedDomains: ['www.example.com'],
    });
  });

  it('does not match subdomains for exact rules', () => {
    expect(
      matchDomainRules(
        ['www.example.com'],
        [
          {
            ...exampleRule,
            includeSubdomains: false,
          },
        ],
      ),
    ).toEqual({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('matches an exact hostname for exact rules', () => {
    expect(
      matchDomainRules(
        ['example.com'],
        [
          {
            ...exampleRule,
            includeSubdomains: false,
          },
        ],
      ).matchedRuleIds,
    ).toEqual([
      'rule-1',
    ]);
  });

  it('ignores disabled rules', () => {
    expect(
      matchDomainRules(
        ['example.com'],
        [
          {
            ...exampleRule,
            enabled: false,
          },
        ],
      ),
    ).toEqual({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('does not match unrelated hostnames', () => {
    expect(
      matchDomainRules(
        [
          'github.com',
          'fakeexample.com',
          'example.com.other.net',
        ],
        [exampleRule],
      ),
    ).toEqual({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('returns empty results without configured rules', () => {
    expect(
      matchDomainRules(
        ['example.com'],
        [],
      ),
    ).toEqual({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('returns empty results without detected domains', () => {
    expect(
      matchDomainRules(
        [],
        [exampleRule],
      ),
    ).toEqual({
      matchedRuleIds: [],
      matchedDomains: [],
    });
  });

  it('matches multiple domain rules', () => {
    const anotherRule: DomainRule = {
      id: 'rule-2',
      domain: 'another.com',
      enabled: true,
      includeSubdomains: true,
    };

    expect(
      matchDomainRules(
        [
          'example.com',
          'www.another.com',
          'unrelated.com',
        ],
        [
          exampleRule,
          anotherRule,
        ],
      ),
    ).toEqual({
      matchedRuleIds: [
        'rule-1',
        'rule-2',
      ],
      matchedDomains: [
        'example.com',
        'www.another.com',
      ],
    });
  });

  it('deduplicates matching rule identifiers', () => {
    expect(
      matchDomainRules(
        [
          'example.com',
          'www.example.com',
          'api.example.com',
        ],
        [exampleRule],
      ).matchedRuleIds,
    ).toEqual([
      'rule-1',
    ]);
  });

  it('deduplicates matching hostnames', () => {
    expect(
      matchDomainRules(
        [
          'example.com',
          'example.com',
        ],
        [exampleRule],
      ).matchedDomains,
    ).toEqual([
      'example.com',
    ]);
  });

  it('supports overlapping domain rules', () => {
    const subdomainRule: DomainRule = {
      id: 'rule-2',
      domain: 'www.example.com',
      enabled: true,
      includeSubdomains: false,
    };

    expect(
      matchDomainRules(
        ['www.example.com'],
        [
          exampleRule,
          subdomainRule,
        ],
      ),
    ).toEqual({
      matchedRuleIds: [
        'rule-1',
        'rule-2',
      ],
      matchedDomains: [
        'www.example.com',
      ],
    });
  });
});
