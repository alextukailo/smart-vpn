
import { type ReactElement } from 'react';

import {
  Shield,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';

import { type VpnConnection } from '@shared/types';

import {
  VpnStatusIndicator,
} from '@renderer/entities/vpn';

import { Card } from '@renderer/shared/ui/card';
import { Button } from '@renderer/shared/ui/button';

interface ConnectionOverviewProps {
  connection?: VpnConnection;
  isBusy: boolean;
  isLoading: boolean;
  isError: boolean;
  onDisconnect: (id: string) => void;
}

export const ConnectionOverview = ({
  connection,
  isBusy,
  isLoading,
  isError,
  onDisconnect,
}: ConnectionOverviewProps): ReactElement => {
  const title = isLoading
    ? 'Checking connections...'
    : isError
      ? 'Status unavailable'
      : connection?.name ?? 'Not connected';

  return (
    <Card className="space-y-5">
      <span className="text-xs font-semibold tracking-wider text-muted uppercase">
        Connection status
      </span>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h2 className="break-words text-2xl font-bold text-primary">
            {title}
          </h2>

          <VpnStatusIndicator
            status={
              isError || isLoading
                ? 'unknown'
                : connection?.status ?? 'disconnected'
            }
          />
        </div>

        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-background">
          {isLoading
            ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-8 animate-spin text-blue"
              />
            )
            : connection
              ? (
                <ShieldCheck
                  aria-hidden="true"
                  className="size-8 text-success"
                />
              )
              : (
                <Shield
                  aria-hidden="true"
                  className="size-8 text-muted"
                />
              )}
        </div>
      </div>

      {connection && !isError && (
        <Button
          variant="secondary"
          fullWidth
          disabled={isBusy}
          onClick={() => onDisconnect(connection.id)}
        >
          Disconnect VPN
        </Button>
      )}
    </Card>
  );
};
