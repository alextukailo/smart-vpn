
import { type ReactElement } from 'react';

import {
  ShieldCheck,
  LockKeyhole,
  AlertCircle,
  X,
} from 'lucide-react';

import { useSystemInfo } from '@renderer/entities/system';
import { useVpnConnections } from '@renderer/entities/vpn';

import { useVpnMutation } from '@renderer/features/manage-vpn';

import {
  ConnectionOverview,
} from '@renderer/widgets/connection-overview';

import {
  VpnConnections,
} from '@renderer/widgets/vpn-connections';

import { Button } from '@renderer/shared/ui/button';

export const DashboardPage = (): ReactElement => {
  const systemQuery = useSystemInfo();
  const vpnQuery = useVpnConnections();
  const vpnMutation = useVpnMutation();

  const connections = vpnQuery.data ?? [];

  const activeConnection = connections.find(
    (connection) => connection.status === 'connected',
  );

  const platform = systemQuery.data?.platform;

  const platformName = platform === 'darwin'
    ? 'macOS'
    : platform === 'win32'
      ? 'Windows'
      : 'Unknown';

  const handleConnect = (id: string): void => {
    if (vpnMutation.isPending) {
      return;
    }

    vpnMutation.mutate({
      id,
      action: 'connect',
    });
  };

  const handleDisconnect = (id: string): void => {
    if (vpnMutation.isPending) {
      return;
    }

    vpnMutation.mutate({
      id,
      action: 'disconnect',
    });
  };

  const handleRefresh = (): void => {
    void vpnQuery.refetch();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-primary px-6 py-5 text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div
            data-testid="brand-icon"
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent"
          >
            <ShieldCheck
              aria-hidden="true"
              className="size-7 text-primary"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold">
              Smart VPN
            </h1>

            <p className="text-xs text-surface-blue">
              Your connection. Your rules.
            </p>
          </div>

          {systemQuery.data && (
            <div className="rounded-md bg-secondary px-3 py-2 text-xs">
              {`${platformName} · ${systemQuery.data.architecture.toUpperCase()}`}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-6">
        {vpnMutation.isError && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-lg border border-error/20 bg-surface p-4 text-error"
          >
            <AlertCircle
              aria-hidden="true"
              className="size-5 shrink-0"
            />

            <p className="flex-1 break-words text-sm">
              {vpnMutation.error.message}
            </p>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Dismiss error"
              onClick={() => vpnMutation.reset()}
            >
              <X
                aria-hidden="true"
                className="size-4"
              />
            </Button>
          </div>
        )}

        <ConnectionOverview
          connection={activeConnection}
          isBusy={vpnMutation.isPending}
          isLoading={vpnQuery.isPending}
          isError={vpnQuery.isError}
          onDisconnect={handleDisconnect}
        />

        <VpnConnections
          connections={connections}
          isLoading={vpnQuery.isPending}
          isFetching={vpnQuery.isFetching}
          isError={vpnQuery.isError}
          isBusy={vpnMutation.isPending}
          pendingId={vpnMutation.variables?.id}
          pendingAction={vpnMutation.variables?.action}
          onRefresh={handleRefresh}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </main>

      <footer className="mx-auto flex w-full max-w-3xl items-center gap-2 px-6 pb-5 text-xs text-muted">
        <LockKeyhole
          aria-hidden="true"
          className="size-3"
        />

        <span className="flex-1">
          Local connection management · No cloud services
        </span>

        {systemQuery.data && (
          <span>
            {`v${systemQuery.data.appVersion}`}
          </span>
        )}
      </footer>
    </div>
  );
};
