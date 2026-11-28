
import { type ReactElement } from 'react';

import {
  Activity,
  Globe,
  Play,
  Square,
  LockKeyhole,
  LoaderCircle,
} from 'lucide-react';

import {
  type MonitoringStatus,
} from '@shared/types';

import {
  useMonitoringState,
} from '@renderer/entities/monitoring';

import {
  useMonitoringMutation,
} from '@renderer/features/manage-monitoring';

import { Button } from '@renderer/shared/ui/button';
import { Card } from '@renderer/shared/ui/card';

import {
  StatusIndicator,
} from '@renderer/shared/ui/status-indicator';

interface BrowserMonitoringProps {
  supported: boolean;
}

const STATUS_CONFIG: Record<
  MonitoringStatus,
  {
    label: string;
    variant: 'success' | 'neutral' | 'loading' | 'error';
  }
> = {
  stopped: {
    label: 'Stopped',
    variant: 'neutral',
  },

  starting: {
    label: 'Starting...',
    variant: 'loading',
  },

  running: {
    label: 'Monitoring',
    variant: 'success',
  },

  error: {
    label: 'Scan failed',
    variant: 'error',
  },
};

export const BrowserMonitoring = ({
  supported,
}: BrowserMonitoringProps): ReactElement => {
  const monitoringQuery = useMonitoringState();
  const monitoringMutation = useMonitoringMutation();

  const state = monitoringQuery.data;

  const status = state?.status ?? 'stopped';

  const isActive = status !== 'stopped';

  const snapshot = state?.snapshot;

  const matchedDomains = snapshot?.matchedDomains ?? [];

  const statusConfig = STATUS_CONFIG[status];

  const isUnavailable =
    monitoringQuery.isPending ||
    monitoringQuery.isError;

  const isBusy =
    monitoringMutation.isPending ||
    isUnavailable;

  const browserStatus = !snapshot
    ? 'Unknown'
    : snapshot.status === 'running'
      ? 'Running'
      : 'Not running';

  const handleToggle = (): void => {
    if (!isBusy && supported) {
      monitoringMutation.mutate(
        isActive ? 'stop' : 'start',
      );
    }
  };

  return (
    <Card className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent">
          <Activity
            aria-hidden="true"
            className="size-5 text-primary"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-primary">
            Browser monitoring
          </h2>

          <p className="mt-1 text-xs text-muted">
            Google Chrome · macOS
          </p>
        </div>

        {!isUnavailable && (
          <StatusIndicator
            label={statusConfig.label}
            variant={statusConfig.variant}
          />
        )}
      </header>

      {monitoringQuery.isPending && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-muted"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />

          Loading monitoring state...
        </div>
      )}

      {monitoringQuery.isError && (
        <div
          role="alert"
          className="space-y-3 rounded-md bg-error/10 p-3 text-sm text-error"
        >
          <p>Unable to retrieve monitoring state.</p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void monitoringQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {!supported && (
        <p className="text-sm text-muted">
          Browser monitoring is currently available only on macOS.
        </p>
      )}

      {!isUnavailable && supported && (
        <>
          <dl className="space-y-3 rounded-lg bg-surface-light p-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                Browser status
              </dt>

              <dd className="font-medium text-primary">
                {browserStatus}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                Polling interval
              </dt>

              <dd className="font-medium text-primary">
                {`${state?.pollingIntervalSeconds ?? 3} seconds`}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-muted">
                Matching domains
              </dt>

              <dd
                data-testid="matched-domain-count"
                className="font-medium text-primary"
              >
                {snapshot ? matchedDomains.length : '—'}
              </dd>
            </div>

            {snapshot && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">
                  Last checked
                </dt>

                <dd className="font-medium text-primary">
                  {new Date(snapshot.checkedAt).toLocaleTimeString()}
                </dd>
              </div>
            )}
          </dl>

          {state?.error && (
            <div
              role="alert"
              className="space-y-2 rounded-md bg-error/10 p-3 text-sm text-error"
            >
              <p>{state.error}</p>

              <p>
                Monitoring will retry automatically.
              </p>
            </div>
          )}

          {monitoringMutation.isError && (
            <p
              role="alert"
              className="rounded-md bg-error/10 p-3 text-sm text-error"
            >
              {monitoringMutation.error.message}
            </p>
          )}

          {matchedDomains.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted uppercase">
                Detected matches
              </h3>

              <ul className="space-y-2">
                {matchedDomains.map((domain) => (
                  <li
                    key={domain}
                    data-testid="matched-domain"
                    className="flex items-center gap-2 text-sm text-primary"
                  >
                    <Globe
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted"
                    />

                    <span className="break-all">
                      {domain}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {snapshot && matchedDomains.length === 0 && (
            <p className="text-sm text-muted">
              No matching domains detected.
            </p>
          )}

          <Button
            fullWidth
            variant={isActive ? 'secondary' : 'primary'}
            disabled={isBusy}
            onClick={handleToggle}
          >
            {monitoringMutation.isPending
              ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )
              : isActive
                ? (
                  <Square
                    aria-hidden="true"
                    className="size-4"
                  />
                )
                : (
                  <Play
                    aria-hidden="true"
                    className="size-4"
                  />
                )}

            {isActive
              ? 'Stop monitoring'
              : 'Start monitoring'}
          </Button>
        </>
      )}

      <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
        <LockKeyhole
          aria-hidden="true"
          className="size-4 shrink-0"
        />

        <p>Browsing history is not stored.</p>
      </div>
    </Card>
  );
};
