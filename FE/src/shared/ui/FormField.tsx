import type { InputHTMLAttributes, ReactNode } from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="ds-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({
  hasError = false,
  className = '',
  ...props
}: InputProps) {
  const errorClass = hasError ? 'ds-input--error' : '';
  return (
    <input
      className={`ds-input ${errorClass} ${className}`.trim()}
      {...props}
    />
  );
}
