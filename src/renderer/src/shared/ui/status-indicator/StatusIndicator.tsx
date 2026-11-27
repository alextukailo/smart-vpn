import { type ReactElement } from 'react';

import { cn } from '@renderer/shared/lib/cn';

type StatusVariant =
  | 'success'
  | 'neutral'
  | 'loading'
  | 'error';

interface StatusIndicatorProps {
  variant?: StatusVariant;
  label: string;
  className?: string;
}

const indicatorClasses: Record<StatusVariant, string> = {
  success: 'bg-success',
  neutral: 'bg-muted',
  loading: 'bg-blue animate-pulse',
  error: 'bg-error',
};

const textClasses: Record<StatusVariant, string> = {
  success: 'text-success',
  neutral: 'text-muted',
  loading: 'text-blue',
  error: 'text-error',
};

export const StatusIndicator = ({
  variant = 'neutral',
  label,
  className,
}: StatusIndicatorProps): ReactElement => {
  return (
    <div
      role="status"
      className={cn(
        'inline-flex items-center gap-2',
        'text-sm font-medium',
        textClasses[variant],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 shrink-0 rounded-full',
          indicatorClasses[variant],
        )}
      />

      <span>{label}</span>
    </div>
  );
};
