import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`ds-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
