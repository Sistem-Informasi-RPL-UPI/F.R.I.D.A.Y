import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildDayTimeSlots,
  buildKaprodiTemplateXlsx,
  buildOfflineHtmlDocument,
  DEFAULT_RUANGAN,
  matchDosenByCodeOrName,
  normalizeDecimalText,
  normalizeSks,
  parseXlsxRowsByCoordinate,
  splitCombinedClasses,
} from './index';

describe('PRD Mind Mapping Jadwal 2023/2024 (v1.3) shared utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('normalizes SKS (no default 2), decimal text, and combined classes (FR-M5, FR-M6, FR-M7)', () => {
    expect(normalizeSks('[Data Belum Tersedia]')).toBe(0);
    expect(normalizeSks('')).toBe(0);
    expect(normalizeSks('0.0')).toBe(0);
    expect(normalizeSks('3')).toBe(3);

    expect(normalizeDecimalText('7.0')).toBe('7');
    expect(splitCombinedClasses('3A & B')).toEqual(['3A', '3B']);
    expect(splitCombinedClasses('3A, 3B')).toEqual(['3A', '3B']);
    expect(splitCombinedClasses('3A / 3B')).toEqual(['3A', '3B']);
    expect(splitCombinedClasses('A dan B')).toEqual(['A', 'B']);
    expect(splitCombinedClasses('1A + 1B')).toEqual(['1A', '1B']);
  });

  it('matches lecturer by code first, then case/space-insensitive name (FR-M8)', () => {
    const list = [
      { kode: 'DSN001', nama: 'Dr. Budi Santoso, M.Kom.' },
      { kode: 'DSN002', nama: 'Siti Rahmawati, M.T.' },
    ];
    expect(matchDosenByCodeOrName('dsn001', list)?.kode).toBe('DSN001');
    expect(
      matchDosenByCodeOrName('  dr. budi   santoso, m.kom. ', list)?.kode,
    ).toBe('DSN001');
    expect(matchDosenByCodeOrName('Dosen Tidak Dikenal', list)).toBeNull();
  });

  it('builds and parses .xlsx by cell coordinate without external libraries (FR-M1, FR-M4)', async () => {
    const bytes = buildKaprodiTemplateXlsx();
    expect(bytes.byteLength).toBeGreaterThan(200);

    const parsedRows = await parseXlsxRowsByCoordinate(
      bytes.buffer as ArrayBuffer,
    );
    expect(parsedRows).toEqual([]);
  });

  it('recalculates time slots for regular days and Friday prayer break (FR-T1..FR-T3)', () => {
    const mondaySlots = buildDayTimeSlots('SENIN', {
      durasiSks: 45,
      mulaiPagi: '07:00',
      istirahat: 60,
      mulaiPagiJumat: '07:00',
      mulaiSiangJumat: '13:00',
    });

    expect(mondaySlots[0]?.label).toBe('07:00 - 07:45');
    const breakRow = mondaySlots.find((s) => s.isBreak);
    expect(breakRow?.label).toBe('11:30 - 12:30');
    const pos7 = mondaySlots.find((s) => s.pos === 7);
    expect(pos7?.label).toBe('12:30 - 13:15');
  });

  it('builds self-contained offline HTML without external URLs (FR-E3)', () => {
    const html = buildOfflineHtmlDocument(DEFAULT_RUANGAN, [], [], {
      durasiSks: 50,
      mulaiPagi: '07:00',
      istirahat: 60,
      mulaiPagiJumat: '07:00',
      mulaiSiangJumat: '13:00',
    });
    expect(html).toContain('Mind Mapping Jadwal Perkuliahan 2023/2024');
    expect(html).not.toContain('https://');
    expect(html).not.toContain('http://');
  });
});
