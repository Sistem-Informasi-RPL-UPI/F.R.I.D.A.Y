import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('application foundation & PRD Mind Mapping Jadwal v1.3 multi-page workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it('navigates across multi-page /admin/... sidebar routes and auto-collapses on matrix page', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dosen']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Kelola Dosen' })).toBeTruthy();

    fireEvent.click(
      screen.getByRole('link', { name: /Penjadwalan & Mind Mapping/i }),
    );
    expect(
      screen.getByRole('heading', { name: /Integrator & Generator Jadwal/i }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /Generate Jadwal Otomatis/i }),
    );
    expect(screen.getByText(/Laporan Audit Generator/i)).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Buka Matriks Mind Mapping \(37 Ruangan\)/i,
      }),
    );
    expect(
      screen.getByRole('heading', {
        name: /Matriks Mind Mapping \(37 Ruangan\)/i,
      }),
    ).toBeTruthy();

    const sidebar = screen.getByRole('complementary', {
      name: /Sidebar Navigasi Admin/i,
    });
    expect(sidebar.className).toContain('ds-sidebar--collapsed');
  });

  it('prompts break split confirmation when 5 SKS course is placed at Pos 4 and splits into 3+2 SKS (FR-S1..FR-S6)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/jadwal/matriks']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Praktikum Jaringan & Sistem Tertanam/i));

    fireEvent.change(screen.getByLabelText(/Ruangan \(1–37\)/i), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/Pos Awal/i), {
      target: { value: '4' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Tempatkan di Slot Ini/i }),
    );

    expect(
      screen.getByText(
        /Mata kuliah ini \(5 SKS\) akan menabrak jam istirahat\. Pecah menjadi 3 SKS sebelum istirahat dan 2 SKS sesudah istirahat\?/i,
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Ya, pecah/i }));

    expect(screen.getByText(/\(1\/2\) Terpisah/i)).toBeTruthy();
    expect(screen.getByText(/\(2\/2\) Terpisah/i)).toBeTruthy();
  });
});
