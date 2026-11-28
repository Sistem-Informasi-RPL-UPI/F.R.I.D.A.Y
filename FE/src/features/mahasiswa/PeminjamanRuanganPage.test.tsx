import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { JadwalProvider } from '../../shared/jadwal';
import { PeminjamanRuanganPage } from './pages/PeminjamanRuanganPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <JadwalProvider>
        <PeminjamanRuanganPage />
      </JadwalProvider>
    </MemoryRouter>,
  );
}

describe('PeminjamanRuanganPage (2-Step Campus Map -> Floor Tabs, Denah Lantai & Rooms)', () => {
  beforeAll(() => {
    if (typeof window.ResizeObserver === 'undefined') {
      window.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    if (typeof window.matchMedia === 'undefined') {
      window.matchMedia = () =>
        ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
    }
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Step 1 interactive campus map with aligned rotated text inside buildings & facilities', () => {
    renderPage();

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Peminjaman Ruangan' }),
    ).toBeTruthy();

    expect(screen.getByTestId('map-building-A').getAttribute('role')).toBe(
      'button',
    );
    expect(screen.getByTestId('map-building-B').getAttribute('role')).toBe(
      'button',
    );
    expect(screen.getByTestId('map-building-E').getAttribute('role')).toBe(
      'button',
    );

    // Pastikan teks gedung aktif berada di dalam grup rotasi yang sinkron dengan kemiringan bentuk gedung
    expect(
      screen
        .getByTestId('map-building-E')
        .querySelector('g[transform="rotate(-10)"] text'),
    ).toBeTruthy();
    expect(
      screen
        .getByTestId('map-building-B')
        .querySelector('g[transform="rotate(-3)"] text'),
    ).toBeTruthy();
    expect(
      screen
        .getByTestId('map-building-A')
        .querySelector('g[transform="rotate(-3)"] text'),
    ).toBeTruthy();

    // Fasilitas & gedung non-peminjaman juga ikut miring sinkron dan tidak bisa dipilih
    for (const label of [
      'Gedung C',
      'Gedung D',
      'Gedung F',
      'Lapangan',
      'Mesjid',
    ]) {
      const node = screen.getByText(label);
      expect(node.closest('g[transform^="rotate("]')).toBeTruthy();
    }

    expect(
      screen.queryByRole('button', { name: /Gedung C|Gedung D|Gedung F/i }),
    ).toBeNull();
  });

  it('auto-opens Gedung B Lantai 2 (skipping non-bookable Lantai 1) and switches across all 5 floors in place', () => {
    renderPage();

    const continueBtn = screen.getByRole('button', {
      name: /Pilih Gedung Terlebih Dahulu/i,
    }) as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(true);

    fireEvent.click(screen.getByTestId('map-building-B'));
    expect(
      screen.getByTestId('building-card-B').getAttribute('aria-pressed'),
    ).toBe('true');

    // Quick floor shortcuts appear inside selected building card
    expect(screen.getByTestId('quick-floor-B-1')).toBeTruthy();
    expect(screen.getByTestId('quick-floor-B-5')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /Lihat Ruangan \(Gedung B\)/i }),
    );

    // Auto-opens Lantai 2 (first floor with bookable rooms)
    expect(
      screen.getByRole('heading', {
        name: /Daftar Ruangan — Gedung B, Lantai 2/i,
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('room-card-B.02.002')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.02.005')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.02.006')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.02.007')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.02.009')).toBeTruthy();
    // Non-bookable Magister PGSD rooms appear on floor plan as orientation only
    expect(screen.getAllByText(/Magister PGSD/i).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.queryByRole('button', { name: /Magister PGSD/i })).toBeNull();

    // Switch to Lantai 1 (non-bookable orientation floor plan + jump CTA)
    fireEvent.click(screen.getByTestId('floor-tab-1'));
    expect(
      screen.getByRole('heading', { name: /Denah Gedung B — Lantai 1/i }),
    ).toBeTruthy();
    expect(screen.getAllByText('Ruang Dosen Prodi').length).toBe(3);
    expect(screen.getByText('Ruang Dosen')).toBeTruthy();
    expect(screen.getByText('PINTU MASUK')).toBeTruthy();
    expect(screen.getByTestId('empty-floor-state')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /Ruang Dosen Prodi RPL/i }),
    ).toBeNull();

    // Switch to Lantai 3 (7 rooms + shortCode search)
    fireEvent.click(screen.getByTestId('floor-tab-3'));
    expect(screen.getByTestId('room-card-B.03.000')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.001')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.002')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.005')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.006')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.007')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.03.009')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Cari ruangan'), {
      target: { value: 'B3.001' },
    });
    expect(screen.getByTestId('room-card-B.03.001')).toBeTruthy();
    expect(screen.queryByTestId('room-card-B.03.002')).toBeNull();

    // Reset filter and switch to Lantai 4 (5 bookable rooms + Perpustakaan non-bookable)
    fireEvent.change(screen.getByLabelText('Cari ruangan'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByTestId('floor-tab-4'));
    expect(screen.getByTestId('room-card-B.04.000')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.04.001')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.04.002')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.04.005')).toBeTruthy();
    expect(screen.getByTestId('room-card-B.04.006')).toBeTruthy();
    expect(screen.getByText('Ruang Perpustakaan')).toBeTruthy();
    expect(screen.getByText('B.04.007')).toBeTruthy();
    expect(screen.queryByTestId('room-card-B.04.007')).toBeNull();
    expect(screen.queryByRole('button', { name: /Perpustakaan/i })).toBeNull();

    // Switch to Lantai 5 (all 8 lecture rooms)
    fireEvent.click(screen.getByTestId('floor-tab-5'));
    for (const code of [
      'B.05.000',
      'B.05.001',
      'B.05.002',
      'B.05.005',
      'B.05.006',
      'B.05.007',
      'B.05.008',
      'B.05.009',
    ]) {
      expect(screen.getByTestId(`room-card-${code}`)).toBeTruthy();
    }
  });

  it('renders Gedung E Lantai 1-3 via 2-step flow and quick floor shortcuts', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('map-building-E'));
    fireEvent.click(
      screen.getByRole('button', { name: /Lihat Ruangan \(Gedung E\)/i }),
    );

    expect(
      screen.getByRole('heading', { name: /Denah Gedung E — Lantai 1/i }),
    ).toBeTruthy();
    expect(screen.getByText('TOILET')).toBeTruthy();
    expect(screen.getByText('TANGGA')).toBeTruthy();

    expect(screen.getByTestId('room-card-CBR 1.420.10.01.079')).toBeTruthy();
    expect(screen.getByTestId('room-card-20.4E.01.000')).toBeTruthy();
    expect(screen.getByTestId('room-card-20.4E.01.003')).toBeTruthy();
    expect(screen.getByTestId('room-card-20.4E.01.004')).toBeTruthy();

    expect(
      screen.getByTestId('floorplan-room-20.4E.01.000').getAttribute('role'),
    ).toBe('button');

    fireEvent.click(screen.getByRole('button', { name: 'Aula & Rapat' }));
    expect(screen.getByTestId('room-card-20.4E.01.000')).toBeTruthy();
    expect(screen.queryByTestId('room-card-20.4E.01.003')).toBeNull();

    // Switch to Lantai 2 (Gudang non-bookable + shortCode search)
    fireEvent.click(screen.getByRole('button', { name: 'Semua' }));
    fireEvent.click(screen.getByTestId('floor-tab-2'));
    expect(screen.getByText('Ruang Gudang')).toBeTruthy();
    expect(screen.getByText('20.4E.02.007')).toBeTruthy();
    expect(screen.queryByTestId('room-card-20.4E.02.007')).toBeNull();

    fireEvent.change(screen.getByLabelText('Cari ruangan'), {
      target: { value: 'E2.005' },
    });
    expect(screen.getByTestId('room-card-20.4E.02.005')).toBeTruthy();
    expect(screen.queryByTestId('room-card-20.4E.02.001')).toBeNull();

    // Switch to Lantai 3 (no Toilet)
    fireEvent.change(screen.getByLabelText('Cari ruangan'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByTestId('floor-tab-3'));
    expect(screen.getByText('TANGGA')).toBeTruthy();
    expect(screen.queryByText('TOILET')).toBeNull();
    expect(screen.getByTestId('room-card-20.4E.03.000')).toBeTruthy();
    expect(screen.getByTestId('room-card-20.4E.03.003')).toBeTruthy();
  });

  it('allows jumping via quick-floor shortcut and submitting booking from floor plan', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('building-card-E'));
    fireEvent.click(screen.getByTestId('quick-floor-E-2'));

    fireEvent.click(screen.getByTestId('floorplan-room-20.4E.02.006'));
    expect(
      screen
        .getByTestId('floorplan-room-20.4E.02.006')
        .getAttribute('aria-pressed'),
    ).toBe('true');

    const selectedBar = screen
      .getByText(/Terpilih:/i)
      .closest('.rmb-floorplan-selected-bar') as HTMLElement;
    expect(selectedBar).toBeTruthy();

    fireEvent.click(
      within(selectedBar).getByRole('button', { name: /Ajukan Peminjaman/i }),
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Ruang Lab Komputer RPL/i)).toBeTruthy();

    fireEvent.change(within(dialog).getByLabelText('Keperluan Kegiatan'), {
      target: { value: 'Praktikum Tambahan Proyek RPL' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: /Kirim Pengajuan/i }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    expect(
      screen.getByText(/20\.4E\.02\.006 — Ruang Lab Komputer RPL/i),
    ).toBeTruthy();
    expect(screen.getByText(/Praktikum Tambahan Proyek RPL/i)).toBeTruthy();
  });

  it('auto-opens Gedung A Lantai 3 and handles switching to empty Lantai 1', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('map-building-A'));
    fireEvent.click(
      screen.getByRole('button', { name: /Lihat Ruangan \(Gedung A\)/i }),
    );

    // Auto-opens Lantai 3 (first active floor with rooms)
    expect(screen.getByTestId('room-card-A3.006')).toBeTruthy();
    expect(screen.getByTestId('room-card-A3.010')).toBeTruthy();
    expect(screen.getByTestId('room-card-A3.011')).toBeTruthy();
    expect(screen.getByTestId('room-card-A3.012')).toBeTruthy();

    // Switch to empty Lantai 1 and jump back via CTA
    fireEvent.click(screen.getByTestId('floor-tab-1'));
    expect(screen.getByTestId('empty-floor-state')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /Lihat Lantai 3 \(4 Ruangan\)/i }),
    );
    expect(screen.getByTestId('room-card-A3.006')).toBeTruthy();
  });
});
