import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone =
  'primary' | 'secondary' | 'accent' | 'success' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({
  tone = 'primary',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`ds-badge ds-badge--${tone} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
