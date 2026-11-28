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

  it('decompresses large (>50KB) deflate-raw worksheet without stream backpressure deadlock', async () => {
    // Build a large worksheet XML (>55KB, 100 rows) compressed with deflate-raw (method 8) like openpyxl
    const rowsXml: string[] = [
      '<row r="1"><c r="A1" t="inlineStr"><is><t>Program Studi</t></is></c><c r="B1" t="inlineStr"><is><t>Kode Mata Kuliah</t></is></c><c r="C1" t="inlineStr"><is><t>Nama Mata Kuliah</t></is></c></row>',
    ];
    for (let r = 2; r <= 101; r++) {
      rowsXml.push(
        `<row r="${r}"><c r="A${r}" t="inlineStr"><is><t>Rekayasa Perangkat Lunak</t></is></c><c r="B${r}" t="inlineStr"><is><t>RL${100 + r}</t></is></c><c r="C${r}" t="inlineStr"><is><t>Mata Kuliah Pengujian Perangkat Lunak Ke-${r} Dengan Nama Panjang</t></is></c><c r="D${r}"><v>3</v></c><c r="E${r}"><v>5</v></c><c r="F${r}" t="inlineStr"><is><t>5A</t></is></c><c r="G${r}" t="inlineStr"><is><t>DSN001</t></is></c><c r="I${r}" t="inlineStr"><is><t>Ruang Kelas Biasa</t></is></c></row>`,
      );
    }
    const bigSheetXml = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml.join('')}</sheetData></worksheet>`;
    const rawBytes = new TextEncoder().encode(bigSheetXml);
    expect(rawBytes.byteLength).toBeGreaterThan(35000);

    // Compress using CompressionStream('deflate-raw')
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    const reader = cs.readable.getReader();
    const writePromise = (async () => {
      await writer.write(rawBytes as unknown as BufferSource);
      await writer.close();
    })();
    const chunks: Uint8Array[] = [];
    let compTotal = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        compTotal += value.length;
      }
    }
    await writePromise;
    const compBytes = new Uint8Array(compTotal);
    let off = 0;
    for (const c of chunks) {
      compBytes.set(c, off);
      off += c.length;
    }

    // Wrap into a single-entry method-8 ZIP buffer for xl/worksheets/sheet1.xml
    const nameBytes = new TextEncoder().encode('xl/worksheets/sheet1.xml');
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(8, 8, true); // method 8 = deflate-raw
    lv.setUint32(18, compBytes.length, true);
    lv.setUint32(22, rawBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);

    const zipBuf = new Uint8Array(localHeader.length + compBytes.length);
    zipBuf.set(localHeader, 0);
    zipBuf.set(compBytes, localHeader.length);

    const parsed = await parseXlsxRowsByCoordinate(
      zipBuf.buffer as ArrayBuffer,
    );
    expect(parsed).toHaveLength(100);
    expect(parsed[0]?.B).toBe('RL102');
    expect(parsed[99]?.B).toBe('RL201');
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
