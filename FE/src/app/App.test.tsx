import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('application foundation', () => {
  it('renders the home screen without an API connection', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'FRIDAY',
    );
  });

  it('handles unknown routes and allows returning home', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Page not found',
    );

    fireEvent.click(screen.getByRole('link', { name: 'Return home' }));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'FRIDAY',
    );
  });
});
