import {
  normalizeDecimalText,
  normalizeKebutuhanRuang,
  normalizeKodeDosen,
  normalizeProdi,
  normalizeSks,
  type DosenStatus,
  type KebutuhanRuang,
} from './types';

export interface ParsedCourseRow {
  prodi: string;
  kode: string;
  nama: string;
  sks: number;
  semester: string;
  kelas: string;
  kodeDosen1?: string;
  dosen1: string;
  kodeDosen2?: string;
  dosen2: string;
  kebutuhanRuang: KebutuhanRuang;
  sourceFile: string;
}

export interface ParsedDosenRow {
  kode: string;
  nama: string;
  status: DosenStatus;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i] ?? 0;
    c = (CRC_TABLE[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Packs an array of UTF-8 file entries into an uncompressed ZIP Uint8Array (method 0 = stored).
 * Valid for Excel .xlsx without any external library.
 */
export function buildZipArchive(
  files: ReadonlyArray<{ path: string; content: string }>,
): Uint8Array {
  const encoder = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.path);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // stored (0)
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const centralSize = centralChunks.reduce((acc, c) => acc + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const out = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of localChunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of centralChunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  out.set(eocd, pos);
  return out;
}

/**
 * Builds the 1-sheet Kaprodi .xlsx template in the browser
 * with 11 header columns (A1..K1):
 * A: Program Studi (Dropdown)
 * B: Kode Mata Kuliah
 * C: Nama Mata Kuliah
 * D: SKS
 * E: Semester
 * F: Kelas
 * G: Kode Dosen 1
 * H: Nama Dosen 1
 * I: Kode Dosen 2
 * J: Nama Dosen 2
 * K: Kebutuhan Ruang Kelas (Dropdown)
 */
export function buildKaprodiTemplateXlsx(): Uint8Array {
  const headers = [
    'Program Studi',
    'Kode Mata Kuliah',
    'Nama Mata Kuliah',
    'SKS',
    'Semester',
    'Kelas',
    'Kode Dosen 1',
    'Nama Dosen 1',
    'Kode Dosen 2',
    'Nama Dosen 2',
    'Kebutuhan Ruang Kelas',
  ];

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const headerCells = headers
    .map(
      (h, idx) =>
        `<c r="${colLetters[idx]}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`,
    )
    .join('');

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">${headerCells}</row>
  </sheetData>
  <dataValidations count="2">
    <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="A2:A500">
      <formula1>"PGSD,PGPAUD,Teknik Komputer,RPL,PMM"</formula1>
    </dataValidation>
    <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="K2:K500">
      <formula1>"Ruang Kelas Biasa,Laboratorium Praktikum,Online"</formula1>
    </dataValidation>
  </dataValidations>
</worksheet>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Mata Kuliah" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  return buildZipArchive([
    { path: '[Content_Types].xml', content: contentTypesXml },
    { path: '_rels/.rels', content: rootRelsXml },
    { path: 'xl/workbook.xml', content: workbookXml },
    { path: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    { path: 'xl/worksheets/sheet1.xml', content: sheetXml },
  ]);
}

export function downloadKaprodiTemplate(): void {
  const bytes = buildKaprodiTemplateXlsx();
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Kaprodi_Mata_Kuliah.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    // Write and read concurrently so TransformStream backpressure never deadlocks on large (>16KB) sheets
    const writeTask = (async () => {
      await writer.write(compressed as unknown as BufferSource);
      await writer.close();
    })();

    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
      }
    }
    await writeTask;

    const result = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      result.set(c, offset);
      offset += c.length;
    }
    return result;
  }
  return compressed;
}

/**
 * Extracts XML entries from a .xlsx ArrayBuffer using Central Directory / Local Headers
 * and browser DecompressionStream("deflate-raw").
 */
export async function extractZipEntries(
  buffer: ArrayBuffer,
): Promise<Record<string, string>> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const decoder = new TextDecoder('utf-8');
  const entries: Record<string, string> = {};

  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset !== -1) {
    const totalEntries = view.getUint16(eocdOffset + 10, true);
    let cdOffset = view.getUint32(eocdOffset + 16, true);

    for (let e = 0; e < totalEntries && cdOffset + 46 <= bytes.length; e++) {
      if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
      const method = view.getUint16(cdOffset + 10, true);
      const compSize = view.getUint32(cdOffset + 20, true);
      const nameLen = view.getUint16(cdOffset + 28, true);
      const extraLen = view.getUint16(cdOffset + 30, true);
      const commentLen = view.getUint16(cdOffset + 32, true);
      const localOffset = view.getUint32(cdOffset + 42, true);

      const fileName = decoder.decode(
        bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen),
      );
      cdOffset += 46 + nameLen + extraLen + commentLen;

      if (localOffset + 30 > bytes.length) continue;
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const rawSlice = bytes.subarray(dataStart, dataStart + compSize);

      if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
        const decompressed =
          method === 8 ? await inflateRawBytes(rawSlice) : rawSlice;
        entries[fileName] = decoder.decode(decompressed);
      }
    }
    return entries;
  }

  // Fallback linear local header scan
  let pos = 0;
  while (pos + 30 <= bytes.length) {
    if (view.getUint32(pos, true) !== 0x04034b50) break;
    const method = view.getUint16(pos + 8, true);
    const compSize = view.getUint32(pos + 18, true);
    const nameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    const fileName = decoder.decode(
      bytes.subarray(pos + 30, pos + 30 + nameLen),
    );
    const dataStart = pos + 30 + nameLen + extraLen;
    const rawSlice = bytes.subarray(dataStart, dataStart + compSize);

    if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
      const decompressed =
        method === 8 ? await inflateRawBytes(rawSlice) : rawSlice;
      entries[fileName] = decoder.decode(decompressed);
    }
    pos = dataStart + compSize;
  }

  return entries;
}

/**
 * FR-M4: Reads .xlsx using explicit cell coordinates (r="A2" .. r="I2") so blank columns never shift values.
 */
export async function parseXlsxRowsByCoordinate(
  buffer: ArrayBuffer,
): Promise<Array<Record<string, string>>> {
  const entries = await extractZipEntries(buffer);
  const parser = new DOMParser();

  const sharedStrings: string[] = [];
  const sharedXml = entries['xl/sharedStrings.xml'];
  if (sharedXml) {
    const ssDoc = parser.parseFromString(sharedXml, 'application/xml');
    const siList = Array.from(ssDoc.getElementsByTagName('si'));
    for (const si of siList) {
      const tNodes = Array.from(si.getElementsByTagName('t'));
      sharedStrings.push(tNodes.map((t) => t.textContent ?? '').join(''));
    }
  }

  const sheetKey =
    Object.keys(entries)
      .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k))
      .sort()[0] ?? '';

  const sheetXml = entries[sheetKey];
  if (!sheetXml) {
    return [];
  }

  const doc = parser.parseFromString(sheetXml, 'application/xml');
  const rowElements = Array.from(doc.getElementsByTagName('row'));
  const rows: Array<Record<string, string>> = [];
  const fallbackCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  let headerMap: Record<string, string> = {};

  for (let rIdx = 0; rIdx < rowElements.length; rIdx++) {
    const rowEl = rowElements[rIdx]!;
    const rowNum = rowEl.getAttribute('r') ?? '';
    const isHeaderRow = rowNum === '1' || (rowNum === '' && rIdx === 0);

    const rowData: Record<string, string> = {
      A: '',
      B: '',
      C: '',
      D: '',
      E: '',
      F: '',
      G: '',
      H: '',
      I: '',
      J: '',
      K: '',
    };

    const cells = Array.from(rowEl.getElementsByTagName('c'));
    let hasValue = false;

    for (let cIdx = 0; cIdx < cells.length; cIdx++) {
      const cell = cells[cIdx]!;
      const ref = cell.getAttribute('r') ?? '';
      const colMatch = /^([A-Z]+)\d+$/i.exec(ref);
      const col = colMatch?.[1]?.toUpperCase() ?? fallbackCols[cIdx] ?? '';
      if (!col) continue;

      const type = cell.getAttribute('t') ?? '';
      let val: string;

      if (type === 'inlineStr') {
        const tNodes = Array.from(cell.getElementsByTagName('t'));
        val = tNodes.map((t) => t.textContent ?? '').join('');
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        const rawV = vNode?.textContent ?? '';
        if (type === 's') {
          const idx = Number(rawV);
          val = Number.isFinite(idx) ? (sharedStrings[idx] ?? '') : rawV;
        } else {
          val = rawV;
        }
      }

      const trimmed = val.trim();
      rowData[col] = trimmed;
      if (trimmed !== '') {
        hasValue = true;
      }
    }

    if (isHeaderRow) {
      headerMap = rowData;
      continue;
    }

    if (hasValue) {
      rowData.__FORMAT =
        (headerMap.G ?? '').toUpperCase().includes('KODE') ||
        (headerMap.K ?? '') !== '' ||
        rowData.K !== ''
          ? '11_COL'
          : '9_COL';
      rows.push(rowData);
    }
  }

  return rows;
}

export function parseDelimitedRows(text: string): string[][] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headerLine = lines[0] ?? '';
  const delimiter = headerLine.includes(';')
    ? ';'
    : headerLine.includes('\t')
      ? '\t'
      : ',';

  return lines.slice(1).map((line) =>
    line.split(delimiter).map((cell) =>
      cell
        .trim()
        .replace(/^"(.*)"$/, '$1')
        .trim(),
    ),
  );
}

export async function parseCourseFile(file: File): Promise<ParsedCourseRow[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.xlsx')) {
    const buf = await file.arrayBuffer();
    const coordRows = await parseXlsxRowsByCoordinate(buf);
    return coordRows
      .filter((r) => (r.B ?? '') !== '' || (r.C ?? '') !== '')
      .map((r) => {
        const is11Col = r.__FORMAT === '11_COL';
        if (is11Col) {
          const k1 = (r.G ?? '').trim() === '-' ? '' : (r.G ?? '').trim();
          const n1 = (r.H ?? '').trim() === '-' ? '' : (r.H ?? '').trim();
          const k2 = (r.I ?? '').trim() === '-' ? '' : (r.I ?? '').trim();
          const n2 = (r.J ?? '').trim() === '-' ? '' : (r.J ?? '').trim();
          return {
            prodi: normalizeProdi(r.A ?? 'RPL'),
            kode: (r.B ?? '').trim().toUpperCase(),
            nama: (r.C ?? '').trim(),
            sks: normalizeSks(r.D),
            semester: normalizeDecimalText(r.E || '1'),
            kelas: normalizeDecimalText(r.F || 'A'),
            kodeDosen1: k1 ? normalizeKodeDosen(k1) : undefined,
            dosen1: n1 || k1,
            kodeDosen2: k2 ? normalizeKodeDosen(k2) : undefined,
            dosen2: n2 || k2,
            kebutuhanRuang: normalizeKebutuhanRuang(r.K ?? 'Ruang Kelas Biasa'),
            sourceFile: file.name,
          };
        }

        return {
          prodi: normalizeProdi(r.A ?? 'RPL'),
          kode: (r.B ?? '').trim().toUpperCase(),
          nama: (r.C ?? '').trim(),
          sks: normalizeSks(r.D),
          semester: normalizeDecimalText(r.E || '1'),
          kelas: normalizeDecimalText(r.F || 'A'),
          dosen1: (r.G ?? '').trim(),
          dosen2: (r.H ?? '').trim() === '-' ? '' : (r.H ?? '').trim(),
          kebutuhanRuang: normalizeKebutuhanRuang(r.I ?? 'Ruang Kelas Biasa'),
          sourceFile: file.name,
        };
      });
  }

  const text = await file.text();
  const rows = parseDelimitedRows(text);
  return rows
    .filter((cols) => (cols[1] ?? '') !== '' || (cols[2] ?? '') !== '')
    .map((cols) => {
      const is11Col = cols.length >= 11;
      if (is11Col) {
        const k1 = (cols[6] ?? '').trim() === '-' ? '' : (cols[6] ?? '').trim();
        const n1 = (cols[7] ?? '').trim() === '-' ? '' : (cols[7] ?? '').trim();
        const k2 = (cols[8] ?? '').trim() === '-' ? '' : (cols[8] ?? '').trim();
        const n2 = (cols[9] ?? '').trim() === '-' ? '' : (cols[9] ?? '').trim();
        return {
          prodi: normalizeProdi(cols[0] ?? 'RPL'),
          kode: (cols[1] ?? '').trim().toUpperCase(),
          nama: (cols[2] ?? '').trim(),
          sks: normalizeSks(cols[3]),
          semester: normalizeDecimalText(cols[4] || '1'),
          kelas: normalizeDecimalText(cols[5] || 'A'),
          kodeDosen1: k1 ? normalizeKodeDosen(k1) : undefined,
          dosen1: n1 || k1,
          kodeDosen2: k2 ? normalizeKodeDosen(k2) : undefined,
          dosen2: n2 || k2,
          kebutuhanRuang: normalizeKebutuhanRuang(
            cols[10] ?? 'Ruang Kelas Biasa',
          ),
          sourceFile: file.name,
        };
      }

      return {
        prodi: normalizeProdi(cols[0] ?? 'RPL'),
        kode: (cols[1] ?? '').trim().toUpperCase(),
        nama: (cols[2] ?? '').trim(),
        sks: normalizeSks(cols[3]),
        semester: normalizeDecimalText(cols[4] || '1'),
        kelas: normalizeDecimalText(cols[5] || 'A'),
        dosen1: (cols[6] ?? '').trim(),
        dosen2: (cols[7] ?? '').trim() === '-' ? '' : (cols[7] ?? '').trim(),
        kebutuhanRuang: normalizeKebutuhanRuang(cols[8] ?? 'Ruang Kelas Biasa'),
        sourceFile: file.name,
      };
    });
}

export async function parseDosenFile(file: File): Promise<ParsedDosenRow[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.xlsx')) {
    const buf = await file.arrayBuffer();
    const coordRows = await parseXlsxRowsByCoordinate(buf);
    return coordRows
      .filter((r) => (r.A ?? '') !== '' && (r.B ?? '') !== '')
      .map((r) => {
        const rawStatus = (r.C ?? '').toUpperCase();
        const status: DosenStatus =
          rawStatus.includes('LUAR') || rawStatus === 'DL'
            ? 'Dosen Luar'
            : 'Dosen Tetap';
        return {
          kode: normalizeKodeDosen(r.A ?? ''),
          nama: (r.B ?? '').trim(),
          status,
        };
      });
  }

  const text = await file.text();
  const rows = parseDelimitedRows(text);
  return rows
    .filter((cols) => (cols[0] ?? '') !== '' && (cols[1] ?? '') !== '')
    .map((cols) => {
      const rawStatus = (cols[2] ?? '').toUpperCase();
      const status: DosenStatus =
        rawStatus.includes('LUAR') || rawStatus === 'DL'
          ? 'Dosen Luar'
          : 'Dosen Tetap';
      return {
        kode: normalizeKodeDosen(cols[0] ?? ''),
        nama: (cols[1] ?? '').trim(),
        status,
      };
    });
}
