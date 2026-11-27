import {
  type ComponentPropsWithoutRef,
  type ReactElement,
} from 'react';

import { cn } from '@renderer/shared/lib/cn';

type CardProps = ComponentPropsWithoutRef<'div'>;

export const Card = ({
  className,
  children,
  ...props
}: CardProps): ReactElement => {
  return (
    <div
      {...props}
      className={cn(
        'rounded-xl border border-border',
        'bg-surface p-6 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  );
};
