import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const classes =
    `ds-btn ds-btn--${variant} ds-btn--${size} ${className}`.trim();

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
