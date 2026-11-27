
import { type ReactElement } from 'react';

import {
  Globe,
  Pencil,
  Trash2,
} from 'lucide-react';

import { type DomainRule } from '@shared/types';

import { Button } from '@renderer/shared/ui/button';
import { cn } from '@renderer/shared/lib/cn';

interface DomainRuleItemProps {
  rule: DomainRule;
  disabled: boolean;
  onToggle: (rule: DomainRule) => void;
  onEdit: (rule: DomainRule) => void;
  onRemove: (rule: DomainRule) => void;
}

export const DomainRuleItem = ({
  rule,
  disabled,
  onToggle,
  onEdit,
  onRemove,
}: DomainRuleItemProps): ReactElement => {
  return (
    <li
      data-testid="domain-rule"
      className="flex items-center gap-3 py-4"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background">
        <Globe
          aria-hidden="true"
          className="size-5 text-muted"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3
          className={cn(
            'break-all text-sm font-semibold',
            rule.enabled
              ? 'text-primary'
              : 'text-muted',
          )}
        >
          {rule.domain}
        </h3>

        <p className="text-xs text-muted">
          {rule.includeSubdomains
            ? 'Includes subdomains'
            : 'Exact domain only'}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={rule.enabled}
        aria-label={`Enable rule for ${rule.domain}`}
        disabled={disabled}
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          rule.enabled
            ? 'bg-success'
            : 'bg-muted/40',
        )}
        onClick={() => onToggle(rule)}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm',
            'transition-transform',
            rule.enabled && 'translate-x-4',
          )}
        />
      </button>

      <Button
        variant="ghost"
        size="sm"
        aria-label={`Edit ${rule.domain}`}
        disabled={disabled}
        onClick={() => onEdit(rule)}
      >
        <Pencil
          aria-hidden="true"
          className="size-4"
        />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label={`Delete ${rule.domain}`}
        disabled={disabled}
        className="text-error hover:text-error"
        onClick={() => onRemove(rule)}
      >
        <Trash2
          aria-hidden="true"
          className="size-4"
        />
      </Button>
    </li>
  );
};
