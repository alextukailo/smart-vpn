/* eslint-disable @stylistic/jsx-child-element-spacing */

import {
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react';

import { useIsMutating } from '@tanstack/react-query';

import {
  Globe,
  Plus,
  Check,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';

import { type DomainRule } from '@shared/types';
import { normalizeDomain } from '@shared/lib/domain';

import {
  useSettings,
  settingsKeys,
} from '@renderer/entities/settings';

import { DomainRuleItem } from '@renderer/entities/domain';

import {
  useDomainMutation,
} from '@renderer/features/manage-domains';

import { Card } from '@renderer/shared/ui/card';
import { Button } from '@renderer/shared/ui/button';

export const DomainRules = (): ReactElement => {
  const inputId = useId();

  const settingsQuery = useSettings();
  const domainMutation = useDomainMutation();

  const settingsMutations = useIsMutating({
    mutationKey: settingsKeys.all,
  });

  const [domain, setDomain] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingRule, setRemovingRule] = useState<DomainRule | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const rules = settingsQuery.data?.domains ?? [];

  const isBusy =
    settingsMutations > 0 ||
    settingsQuery.isPending ||
    settingsQuery.isError;

  const activeRules = rules.filter(
    (rule) => rule.enabled,
  ).length;

  const resetForm = (): void => {
    setDomain('');
    setIncludeSubdomains(true);
    setEditingId(null);
    setValidationError(null);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    domainMutation.reset();
    setValidationError(null);

    let normalized: string | null | undefined;

    try {
      normalized = normalizeDomain(domain);
    } catch {
      setValidationError('Enter a valid domain or URL');

      return;
    }

    if (!normalized) {
      setValidationError('Enter a valid domain or URL');

      return;
    }

    const duplicate = rules.some(
      (rule) =>
        rule.domain === normalized &&
        rule.id !== editingId,
    );

    if (duplicate) {
      setValidationError('This domain already exists');

      return;
    }

    if (editingId !== null) {
      const existingRule = rules.find(
        (rule) => rule.id === editingId,
      );

      if (!existingRule) {
        setValidationError('Domain rule no longer exists');

        return;
      }

      domainMutation.mutate(
        {
          action: 'update',

          input: {
            id: editingId,
            domain: normalized,
            enabled: existingRule.enabled,
            includeSubdomains,
          },
        },
        {
          onSuccess: resetForm,
        },
      );

      return;
    }

    domainMutation.mutate(
      {
        action: 'add',

        input: {
          domain: normalized,
          includeSubdomains,
        },
      },
      {
        onSuccess: resetForm,
      },
    );
  };

  const handleEdit = (
    rule: DomainRule,
  ): void => {
    domainMutation.reset();

    setEditingId(rule.id);
    setDomain(rule.domain);
    setIncludeSubdomains(rule.includeSubdomains);
    setValidationError(null);
    setRemovingRule(null);
  };

  const handleToggle = (
    rule: DomainRule,
  ): void => {
    domainMutation.reset();

    domainMutation.mutate({
      action: 'update',

      input: {
        ...rule,
        enabled: !rule.enabled,
      },
    });
  };

  const handleRemove = (): void => {
    if (!removingRule || isBusy) {
      return;
    }

    const id = removingRule.id;

    domainMutation.reset();

    domainMutation.mutate(
      {
        action: 'remove',
        id,
      },
      {
        onSuccess: () => {
          if (editingId === id) {
            resetForm();
          }

          setRemovingRule(null);
        },
      },
    );
  };

  return (
    <Card className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent">
          <Globe
            aria-hidden="true"
            className="size-5 text-primary"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-primary">
            Domain rules
          </h2>

          <p className="mt-1 text-xs text-muted">
            Websites that require VPN activation
          </p>
        </div>
      </header>

      {settingsQuery.isPending && (
        <div
          role="status"
          className="flex items-center gap-3 py-4 text-sm text-muted"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin"
          />

          Loading domain rules...
        </div>
      )}

      {settingsQuery.isError && (
        <div
          role="alert"
          className="space-y-3 rounded-md bg-error/10 p-4 text-sm text-error"
        >
          <p>Unable to load domain rules.</p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void settingsQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {settingsQuery.isSuccess && (
        <>
          <form
            noValidate
            className="space-y-4 rounded-lg bg-surface-light p-4"
            onSubmit={handleSubmit}
          >
            <label
              htmlFor={inputId}
              className="block text-sm font-semibold text-primary"
            >
              {editingId === null
                ? 'Add a domain'
                : 'Edit domain'}
            </label>

            <input
              id={inputId}
              type="text"
              value={domain}
              placeholder="example.com"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={2048}
              disabled={isBusy}
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError
                  ? `${inputId}-error`
                  : undefined
              }
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              onChange={(event) => {
                setDomain(event.target.value);
                setValidationError(null);
              }}
            />

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={includeSubdomains}
                disabled={isBusy}
                className="size-4 accent-blue"
                onChange={(event) => {
                  setIncludeSubdomains(
                    event.target.checked,
                  );
                }}
              />

              Include subdomains
            </label>

            {validationError && (
              <p
                id={`${inputId}-error`}
                role="alert"
                className="text-sm text-error"
              >
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              {editingId !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isBusy || !domain.trim()}
              >
                {domainMutation.isPending
                  ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  )
                  : editingId === null
                    ? (
                      <Plus
                        aria-hidden="true"
                        className="size-4"
                      />
                    )
                    : (
                      <Check
                        aria-hidden="true"
                        className="size-4"
                      />
                    )}

                {editingId === null
                  ? 'Add domain'
                  : 'Save changes'}
              </Button>
            </div>
          </form>

          {domainMutation.isError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md bg-error/10 p-3 text-sm text-error"
            >
              <AlertCircle
                aria-hidden="true"
                className="size-5 shrink-0"
              />

              <p>{domainMutation.error.message}</p>
            </div>
          )}

          {rules.length === 0
            ? (
              <div className="py-6 text-center">
                <Globe
                  aria-hidden="true"
                  className="mx-auto mb-3 size-8 text-muted"
                />

                <p className="font-medium text-primary">
                  No domain rules yet
                </p>

                <p className="mt-2 text-sm text-muted">
                  Add a website to configure automatic VPN activation.
                </p>
              </div>
            )
            : (
              <ul className="divide-y divide-border">
                {rules.map((rule) => (
                  <DomainRuleItem
                    key={rule.id}
                    rule={rule}
                    disabled={isBusy}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onRemove={setRemovingRule}
                  />
                ))}
              </ul>
            )}

          {removingRule && (
            <div
              role="group"
              aria-label="Confirm domain removal"
              className="space-y-3 rounded-md border border-error/20 bg-error/5 p-4"
            >
              <p className="text-sm text-primary">
                {`Remove ${removingRule.domain} from domain rules?`}
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => setRemovingRule(null)}
                >
                  Keep domain
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  disabled={isBusy}
                  onClick={handleRemove}
                >
                  Confirm removal
                </Button>
              </div>
            </div>
          )}

          <p
            role="status"
            className="border-t border-border pt-4 text-xs text-muted"
          >
            {`${activeRules} active rules · ${rules.length} total`}
          </p>
        </>
      )}
    </Card>
  );
};
