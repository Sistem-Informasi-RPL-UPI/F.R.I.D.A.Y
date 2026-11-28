import type { ReactNode } from 'react';

export interface NavbarProps {
  brand?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Navbar({
  brand,
  children,
  actions,
  className = '',
}: NavbarProps) {
  return (
    <header className={`ds-navbar ${className}`.trim()} role="banner">
      <div className="ds-navbar__container">
        {brand && <div className="ds-navbar__brand">{brand}</div>}
        <nav aria-label="Navigasi Utama" className="ds-navbar__nav">
          {children}
        </nav>
        {actions && <div className="ds-navbar__actions">{actions}</div>}
      </div>
    </header>
  );
}
