import { type DomainRule } from '../../types';

import { matchesDomain } from '../domain';

export interface DomainMatchResult {
  matchedRuleIds: string[];
  matchedDomains: string[];
}

export const matchDomainRules = (
  domains: readonly string[],
  rules: readonly DomainRule[],
): DomainMatchResult => {
  const matchedRuleIds = new Set<string>();
  const matchedDomains = new Set<string>();

  const enabledRules = rules.filter(
    (rule) => rule.enabled,
  );

  for (const domain of domains) {
    for (const rule of enabledRules) {
      const matches = matchesDomain(
        domain,
        rule.domain,
        rule.includeSubdomains,
      );

      if (matches) {
        matchedRuleIds.add(rule.id);
        matchedDomains.add(domain);
      }
    }
  }

  return {
    matchedRuleIds: Array.from(matchedRuleIds),
    matchedDomains: Array.from(matchedDomains),
  };
};
