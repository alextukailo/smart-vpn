import { type ReactElement } from 'react';

import { type VpnStatus } from '@shared/types';

import { StatusIndicator } from '@renderer/shared/ui/status-indicator';

type IndicatorVariant =
  | 'success'
  | 'neutral'
  | 'loading'
  | 'error';

interface VpnStatusIndicatorProps {
  status: VpnStatus;
}

const statusConfig: Record<
  VpnStatus,
  {
    label: string;
    variant: IndicatorVariant;
  }
> = {
  connected: {
    label: 'Connected',
    variant: 'success',
  },

  disconnected: {
    label: 'Disconnected',
    variant: 'neutral',
  },

  connecting: {
    label: 'Connecting...',
    variant: 'loading',
  },

  disconnecting: {
    label: 'Disconnecting...',
    variant: 'loading',
  },

  unknown: {
    label: 'Unknown status',
    variant: 'error',
  },
};

export const VpnStatusIndicator = ({
  status,
}: VpnStatusIndicatorProps): ReactElement => {
  const config = statusConfig[status];

  return (
    <StatusIndicator
      label={config.label}
      variant={config.variant}
    />
  );
};
