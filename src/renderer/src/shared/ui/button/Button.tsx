
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
} from 'react';

import { cn } from '@renderer/shared/lib/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-primary hover:bg-accent-hover',
  secondary: 'bg-primary text-white hover:bg-secondary',
  outline: 'border border-muted bg-transparent text-primary hover:bg-surface-light',
  ghost: 'bg-transparent text-muted hover:bg-surface-light',
  danger: 'bg-error text-white hover:brightness-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps): ReactElement => {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-md font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
};
