
import { type ReactElement } from 'react';

import {
  Shield,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';

import { type VpnConnection } from '@shared/types';

import {
  formatVpnProtocol,
  VpnStatusIndicator,
} from '@renderer/entities/vpn';

import { Button } from '@renderer/shared/ui/button';
import { Card } from '@renderer/shared/ui/card';
import { cn } from '@renderer/shared/lib/cn';

interface VpnConnectionsProps {
  connections: VpnConnection[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isBusy: boolean;
  pendingId?: string;
  pendingAction?: 'connect' | 'disconnect';
  onRefresh: () => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export const VpnConnections = ({
  connections,
  isLoading,
  isFetching,
  isError,
  isBusy,
  pendingId,
  pendingAction,
  onRefresh,
  onConnect,
  onDisconnect,
}: VpnConnectionsProps): ReactElement => {
  const hasActiveConnection = connections.some(
    (connection) => connection.status !== 'disconnected',
  );

  return (
    <Card className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-primary">
            Available connections
          </h2>

          <p className="mt-1 text-xs text-muted">
            {`${connections.length} available`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Refresh VPN connections"
          disabled={isFetching || isBusy}
          onClick={onRefresh}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn(
              'size-4',
              isFetching && 'animate-spin',
            )}
          />
        </Button>
      </header>

      {isLoading && (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-10 text-sm text-muted"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin"
          />

          <span>Discovering VPN connections...</span>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md bg-error/10 p-4 text-sm text-error"
        >
          <AlertCircle
            aria-hidden="true"
            className="size-5 shrink-0"
          />

          <span>Unable to retrieve VPN connections.</span>
        </div>
      )}

      {!isLoading && !isError && connections.length === 0 && (
        <div className="py-8 text-center">
          <Shield
            aria-hidden="true"
            className="mx-auto mb-3 size-8 text-muted"
          />

          <p className="font-medium text-primary">
            No VPN connections found
          </p>

          <p className="mt-2 text-sm text-muted">
            Add a VPN in your operating system settings.
          </p>
        </div>
      )}

      {!isError && (
        <ul className="divide-y divide-border">
          {connections.map((connection) => {
            const isConnected =
              connection.status === 'connected';

            const isPending =
              isBusy && pendingId === connection.id;

            const isTransitioning =
              connection.status === 'connecting' ||
              connection.status === 'disconnecting' ||
              connection.status === 'unknown';

            const canConnect =
              connection.enabled &&
              !hasActiveConnection &&
              !isTransitioning;

            const status = isPending
              ? pendingAction === 'connect'
                ? 'connecting'
                : 'disconnecting'
              : connection.status;

            return (
              <li
                key={connection.id}
                data-testid="vpn-connection"
                className="flex items-center gap-3 py-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-background">
                  <Shield
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="break-words text-sm font-semibold text-primary">
                    {connection.name}
                  </h3>

                  <p className="text-xs text-muted">
                    {formatVpnProtocol(connection.protocol)}
                  </p>

                  <VpnStatusIndicator status={status} />
                </div>

                <Button
                  size="sm"
                  variant={isConnected ? 'outline' : 'primary'}
                  disabled={
                    isBusy ||
                    (!isConnected && !canConnect)
                  }
                  onClick={() => {
                    if (isConnected) {
                      onDisconnect(connection.id);
                    } else {
                      onConnect(connection.id);
                    }
                  }}
                >
                  {isPending && (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  )}

                  <span>
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
