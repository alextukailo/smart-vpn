
import {
  useId,
  type ReactElement,
} from 'react';

import {
  Star,
  AlertCircle,
  LoaderCircle,
  Info,
} from 'lucide-react';

import { type VpnConnection } from '@shared/types';

import {
  formatVpnProtocol,
} from '@renderer/entities/vpn';

import { useSettings } from '@renderer/entities/settings';

import {
  useSetPrimaryVpn,
} from '@renderer/features/select-primary-vpn';

import { Card } from '@renderer/shared/ui/card';
import { Button } from '@renderer/shared/ui/button';
import { cn } from '@renderer/shared/lib/cn';

interface PrimaryVpnProps {
  connections: VpnConnection[];
  isLoading: boolean;
  isError: boolean;
  isBusy: boolean;
}

export const PrimaryVpn = ({
  connections,
  isLoading,
  isError,
  isBusy,
}: PrimaryVpnProps): ReactElement => {
  const groupId = useId();

  const settingsQuery = useSettings();
  const primaryVpnMutation = useSetPrimaryVpn();

  const primaryVpnId =
    settingsQuery.data?.primaryVpnId ?? null;

  const isPending =
    settingsQuery.isPending || isLoading;

  const isSelectionDisabled =
    isPending ||
    isError ||
    isBusy ||
    settingsQuery.isError ||
    primaryVpnMutation.isPending;

  const selectedConnection = connections.find(
    (connection) => connection.id === primaryVpnId,
  );

  const isPrimaryUnavailable =
    !isPending &&
    !isError &&
    !settingsQuery.isError &&
    primaryVpnId !== null &&
    (
      !selectedConnection ||
      !selectedConnection.enabled
    );

  const handleSelect = (
    id: string | null,
  ): void => {
    if (
      isSelectionDisabled ||
      id === primaryVpnId
    ) {
      return;
    }

    primaryVpnMutation.mutate(id);
  };

  return (
    <Card className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent">
          <Star
            aria-hidden="true"
            className="size-5 text-primary"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-primary">
            Primary VPN
          </h2>

          <p className="mt-1 text-xs text-muted">
            Used for automatic VPN activation
          </p>
        </div>
      </header>

      {isPending && (
        <div
          role="status"
          className="flex items-center gap-3 py-4 text-sm text-muted"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin"
          />

          <span>Loading primary VPN settings...</span>
        </div>
      )}

      {settingsQuery.isError && (
        <div
          role="alert"
          className="space-y-3 rounded-md bg-error/10 p-4 text-sm text-error"
        >
          <p>Unable to load application settings.</p>

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

      {isError && (
        <p
          role="alert"
          className="text-sm text-error"
        >
          VPN connections are unavailable.
        </p>
      )}

      {isPrimaryUnavailable && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md bg-error/10 p-3 text-sm text-error"
        >
          <AlertCircle
            aria-hidden="true"
            className="size-5 shrink-0"
          />

          <span>
            The selected primary VPN is no longer available.
          </span>
        </div>
      )}

      {!isPending && !isError && !settingsQuery.isError && (
        <fieldset
          disabled={isSelectionDisabled}
          className="space-y-2"
        >
          <legend className="sr-only">
            Select primary VPN
          </legend>

          {connections.map((connection) => {
            const selected =
              connection.id === primaryVpnId;

            return (
              <label
                key={connection.id}
                className={cn(
                  'flex items-center gap-3 rounded-md border p-3 transition-colors',
                  selected
                    ? 'border-blue bg-surface-light'
                    : 'border-border bg-surface',
                  connection.enabled && !isSelectionDisabled
                    ? 'cursor-pointer hover:bg-background'
                    : 'cursor-not-allowed opacity-60',
                )}
              >
                <input
                  type="radio"
                  name={groupId}
                  value={connection.id}
                  checked={selected}
                  disabled={!connection.enabled}
                  className="size-4 shrink-0 accent-blue"
                  onChange={() => handleSelect(connection.id)}
                />

                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold text-primary">
                    {connection.name}
                  </span>

                  <span className="block text-xs text-muted">
                    {formatVpnProtocol(connection.protocol)}
                  </span>
                </span>

                {selected && (
                  <Star
                    aria-hidden="true"
                    className="size-4 shrink-0 fill-blue text-blue"
                  />
                )}
              </label>
            );
          })}

          {connections.length === 0 && (
            <p className="py-3 text-sm text-muted">
              No VPN connections are available.
            </p>
          )}
        </fieldset>
      )}

      {primaryVpnMutation.isError && (
        <p
          role="alert"
          className="rounded-md bg-error/10 p-3 text-sm text-error"
        >
          {primaryVpnMutation.error.message}
        </p>
      )}

      {!settingsQuery.isPending && !settingsQuery.isError && (
        <div className="flex items-center justify-between gap-3">
          <span
            role="status"
            className="text-xs text-muted"
          >
            {primaryVpnMutation.isPending
              ? 'Saving selection...'
              : primaryVpnId
                ? 'Primary VPN selected'
                : 'No primary VPN selected'}
          </span>

          {primaryVpnId !== null && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isSelectionDisabled}
              onClick={() => handleSelect(null)}
            >
              Clear selection
            </Button>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs text-muted">
        <Info
          aria-hidden="true"
          className="size-4 shrink-0"
        />

        <p>
          Selecting a primary VPN does not establish a connection.
        </p>
      </div>
    </Card>
  );
};
