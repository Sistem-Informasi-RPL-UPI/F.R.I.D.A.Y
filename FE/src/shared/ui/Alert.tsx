import type { HTMLAttributes, ReactNode } from 'react';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  children: ReactNode;
}

export function Alert({
  tone = 'info',
  className = '',
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="status"
      className={`ds-alert ds-alert--${tone} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
