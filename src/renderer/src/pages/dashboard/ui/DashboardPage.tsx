
import { type ReactElement } from 'react';
import { ShieldCheck } from 'lucide-react';

import { useSystemInfo } from '@renderer/entities/system';
import { Card } from '@renderer/shared/ui/card';
import { StatusIndicator } from '@renderer/shared/ui/status-indicator';

export const DashboardPage = (): ReactElement => {
  const {
    data: systemInfo,
    isPending,
    isError,
  } = useSystemInfo();

  const platformName =
    systemInfo?.platform === 'darwin'
      ? 'macOS'
      : systemInfo?.platform === 'win32'
        ? 'Windows'
        : 'Unknown';

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="flex w-full max-w-md flex-col items-center px-8 py-10 text-center">
        <div
          data-testid="brand-icon"
          className="mb-6 flex size-[72px] items-center justify-center rounded-lg bg-accent"
        >
          <ShieldCheck
            aria-hidden="true"
            className="size-10 text-primary"
          />
        </div>

        <span className="text-xs font-semibold tracking-widest text-muted uppercase">
          Connection manager
        </span>

        <h1 className="mt-3 text-4xl font-bold text-primary">
          Smart VPN
        </h1>

        <p className="mt-3 mb-6 text-base text-muted">
          Your connection. Your rules.
        </p>

        {isPending && (
          <StatusIndicator
            variant="loading"
            label="Initializing application..."
          />
        )}

        {isError && (
          <StatusIndicator
            variant="error"
            label="System connection failed"
          />
        )}

        {systemInfo && (
          <>
            <StatusIndicator
              variant={systemInfo.supported ? 'success' : 'error'}
              label={
                systemInfo.supported
                  ? 'Application initialized'
                  : 'Unsupported operating system'
              }
              className="rounded-md bg-background px-4 py-3"
            />

            <dl className="mt-6 w-full space-y-3 rounded-lg bg-surface-light p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">
                  Operating system
                </dt>

                <dd className="font-medium text-primary">
                  {platformName}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted">
                  Architecture
                </dt>

                <dd className="font-medium text-primary">
                  {systemInfo.architecture}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted">
                  Application version
                </dt>

                <dd className="font-medium text-primary">
                  {systemInfo.appVersion}
                </dd>
              </div>
            </dl>
          </>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Automatic VPN management for macOS and Windows.
        </p>
      </Card>
    </main>
  );
};
