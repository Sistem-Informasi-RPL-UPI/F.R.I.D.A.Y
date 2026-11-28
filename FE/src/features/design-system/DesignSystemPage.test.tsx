import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DesignSystemPage } from './pages/DesignSystemPage';

describe('DesignSystemPage', () => {
  it('renders color palette and typography tokens from Group 60', () => {
    render(
      <MemoryRouter>
        <DesignSystemPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Vibrant Blue')).toBeTruthy();
    expect(screen.getByText('#0101B7')).toBeTruthy();
    expect(screen.getByText('Dreamy')).toBeTruthy();
    expect(screen.getByText('#8DCCF1')).toBeTruthy();
    expect(screen.getByText('WarmY')).toBeTruthy();
    expect(screen.getByText('#FFD166')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('#F2F7FF')).toBeTruthy();
  });
});
