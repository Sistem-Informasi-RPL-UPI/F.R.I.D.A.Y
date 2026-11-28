import {
  ALL_DAYS,
  buildDayTimeSlots,
  type DayName,
  type Dosen,
  type MataKuliah,
  type PengaturanWaktu,
  type Ruangan,
} from './types';

function csvEscape(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * FR-E1: CSV (UTF-8 BOM, delimiter `;`):
 * 3 baris header ruangan, isi matriks Senin–Sabtu, tabel rincian MK terjadwal dan diparkir;
 * dosen ditulis `Kode Nama`, segmen terpecah ditandai `(1/2)` dan `(2/2)`.
 */
export function buildFullMatrixCsv(
  rooms: readonly Ruangan[],
  courses: readonly MataKuliah[],
  settings: PengaturanWaktu,
): string {
  const lines: string[] = [];

  // 3 rows of room headers matching MAP JADWAL GANJIL 2023-2024_kosong.xlsx
  lines.push(
    ['HARI', 'JAM', 'Pos', ...rooms.map((r) => csvEscape(r.label))].join(';'),
  );
  lines.push(['', '', '', ...rooms.map((r) => csvEscape(r.kode))].join(';'));
  lines.push(['', '', '', ...rooms.map((r) => csvEscape(r.urutan))].join(';'));

  // Build quick lookup: day|room|pos -> formatted text
  const slotMap = new Map<string, string>();
  for (const mk of courses) {
    if (mk.statusAntrean !== 'ready') continue;
    const d1 = mk.dosen1
      ? `${mk.dosen1.kode} ${mk.dosen1.nama}`
      : (mk.kodeDosen1 ?? '-');
    const d2 = mk.dosen2 ? ` / ${mk.dosen2.kode} ${mk.dosen2.nama}` : '';

    for (const seg of mk.segments) {
      const splitTag = seg.badgeLabel ? ` ${seg.badgeLabel}` : '';
      const cellText = `${mk.prodi} ${mk.semester}${mk.kelas} - ${mk.kode} ${mk.nama} (${seg.len} SKS)${splitTag} [${d1}${d2}]`;
      for (let p = seg.pos; p < seg.pos + seg.len; p++) {
        slotMap.set(`${seg.day}|${seg.room}|${p}`, cellText);
      }
    }
  }

  for (const day of ALL_DAYS) {
    const slots = buildDayTimeSlots(day, settings);
    slots.forEach((slot, idx) => {
      const dayCol = idx === 0 ? day : '';
      if (slot.isBreak) {
        lines.push(
          [
            dayCol,
            slot.label,
            'ISTIRAHAT',
            ...rooms.map(() => 'ISTIRAHAT'),
          ].join(';'),
        );
      } else {
        const rowCells = rooms.map((r) =>
          csvEscape(slotMap.get(`${day}|${r.id}|${slot.pos}`) ?? ''),
        );
        lines.push(
          [dayCol, slot.label, String(slot.pos ?? ''), ...rowCells].join(';'),
        );
      }
    });
  }

  lines.push('');
  lines.push('RINCIAN MATA KULIAH TERJADWAL DAN DIPARKIR');
  lines.push(
    [
      'Kode MK',
      'Nama Mata Kuliah',
      'Prodi',
      'Semester',
      'Kelas',
      'SKS',
      'Dosen 1',
      'Dosen 2',
      'Hari',
      'Jam',
      'Ruang',
      'Status',
      'Keterangan Parkir',
    ].join(';'),
  );

  for (const mk of courses) {
    if (mk.statusAntrean !== 'ready') continue;
    const d1 = mk.dosen1
      ? `${mk.dosen1.kode} ${mk.dosen1.nama}`
      : (mk.kodeDosen1 ?? '-');
    const d2 = mk.dosen2
      ? `${mk.dosen2.kode} ${mk.dosen2.nama}`
      : (mk.kodeDosen2 ?? '-');
    lines.push(
      [
        csvEscape(mk.kode),
        csvEscape(mk.nama),
        csvEscape(mk.prodi),
        csvEscape(mk.semester),
        csvEscape(mk.kelas),
        csvEscape(mk.sksDisplay),
        csvEscape(d1),
        csvEscape(d2),
        csvEscape(mk.hariDisplay),
        csvEscape(mk.timeDisplay),
        csvEscape(mk.ruangDisplay),
        csvEscape(mk.status),
        csvEscape(mk.parkedReason ?? ''),
      ].join(';'),
    );
  }

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * FR-L4: Filtered course list CSV export for Daftar Mata Kuliah page.
 */
export function buildFilteredCoursesCsv(
  courses: readonly MataKuliah[],
): string {
  const lines: string[] = [
    [
      'Kode',
      'Nama Mata Kuliah',
      'Prodi',
      'Semester',
      'Kelas',
      'SKS',
      'Dosen 1',
      'Dosen 2',
      'Hari',
      'Jam',
      'Ruang',
      'Status',
    ].join(';'),
  ];

  for (const mk of courses) {
    const d1 = mk.dosen1
      ? `${mk.dosen1.kode} ${mk.dosen1.nama}`
      : (mk.kodeDosen1 ?? '-');
    const d2 = mk.dosen2
      ? `${mk.dosen2.kode} ${mk.dosen2.nama}`
      : (mk.kodeDosen2 ?? '-');
    lines.push(
      [
        csvEscape(mk.kode),
        csvEscape(mk.nama),
        csvEscape(mk.prodi),
        csvEscape(mk.semester),
        csvEscape(mk.kelas),
        csvEscape(mk.sksDisplay),
        csvEscape(d1),
        csvEscape(d2),
        csvEscape(mk.hariDisplay),
        csvEscape(mk.timeDisplay),
        csvEscape(mk.ruangDisplay),
        csvEscape(mk.status),
      ].join(';'),
    );
  }

  return '\uFEFF' + lines.join('\r\n');
}

export function triggerBlobDownload(
  content: string | Blob,
  fileName: string,
  mimeType = 'text/csv;charset=utf-8;',
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * FR-E2: PNG and JPG HD using 2x scale Canvas following active building & day filter.
 */
export function exportMatrixImage(
  format: 'png' | 'jpeg',
  rooms: readonly Ruangan[],
  days: readonly DayName[],
  courses: readonly MataKuliah[],
  settings: PengaturanWaktu,
): void {
  const scale = 2;
  const leftColsWidth = 210;
  const colWidth = 155;
  const headerHeight = 84;
  const rowHeight = 42;

  const dayRows: Array<{
    day: DayName;
    isFirstOfDay: boolean;
    slot: ReturnType<typeof buildDayTimeSlots>[number];
  }> = [];
  for (const day of days) {
    const slots = buildDayTimeSlots(day, settings);
    slots.forEach((slot, idx) => {
      dayRows.push({ day, isFirstOfDay: idx === 0, slot });
    });
  }

  const width = leftColsWidth + Math.max(1, rooms.length) * colWidth;
  const height = headerHeight + dayRows.length * rowHeight + 48;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#F2F7FF';
  ctx.fillRect(0, 0, width, height);

  // Title bar
  ctx.fillStyle = '#0101B7';
  ctx.fillRect(0, 0, width, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(
    'MIND MAPPING JADWAL PERKULIAHAN 2023/2024 — UPI KAMPUS CIBIRU',
    14,
    23,
  );

  // Table headers
  const topY = 36;
  ctx.fillStyle = '#0B2239';
  ctx.fillRect(0, topY, leftColsWidth, headerHeight);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('HARI', 10, topY + 45);
  ctx.fillText('JAM', 68, topY + 45);
  ctx.fillText('Pos', 172, topY + 45);

  rooms.forEach((room, idx) => {
    const x = leftColsWidth + idx * colWidth;
    ctx.fillStyle = '#0101B7';
    ctx.fillRect(x, topY, colWidth - 1, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(room.label.slice(0, 22), x + 6, topY + 18);

    ctx.fillStyle = '#E6E8FF';
    ctx.fillRect(x, topY + 28, colWidth - 1, 28);
    ctx.fillStyle = '#0B2239';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(room.kode, x + 6, topY + 46);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, topY + 56, colWidth - 1, 28);
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Ruang #${room.urutan}`, x + 6, topY + 74);
  });

  // Lookup segments
  const segLookup = new Map<
    string,
    { mk: MataKuliah; len: number; badge: string | null }
  >();
  for (const mk of courses) {
    for (const seg of mk.segments) {
      segLookup.set(`${seg.day}|${seg.room}|${seg.pos}`, {
        mk,
        len: seg.len,
        badge: seg.badgeLabel,
      });
    }
  }

  // Rows
  dayRows.forEach((row, rIdx) => {
    const y = topY + headerHeight + rIdx * rowHeight;
    ctx.fillStyle = row.slot.isBreak ? '#FFF6DB' : '#FFFFFF';
    ctx.fillRect(0, y, width, rowHeight - 1);

    ctx.fillStyle = '#0B2239';
    ctx.font = 'bold 10px sans-serif';
    if (row.isFirstOfDay) {
      ctx.fillText(row.day, 8, y + 24);
    }
    ctx.font = '10px sans-serif';
    ctx.fillText(row.slot.label, 64, y + 24);
    ctx.fillText(
      row.slot.isBreak ? 'IST' : String(row.slot.pos ?? ''),
      174,
      y + 24,
    );

    if (row.slot.isBreak) {
      ctx.fillStyle = '#B45309';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('JAM ISTIRAHAT', leftColsWidth + 16, y + 24);
      return;
    }

    rooms.forEach((room, cIdx) => {
      const x = leftColsWidth + cIdx * colWidth;
      const hit = segLookup.get(`${row.day}|${room.id}|${row.slot.pos}`);
      if (!hit) return;

      const cardH = hit.len * rowHeight - 4;
      ctx.fillStyle = '#E6E8FF';
      ctx.fillRect(x + 2, y + 2, colWidth - 5, cardH);
      ctx.fillStyle = '#0101B7';
      ctx.fillRect(x + 2, y + 2, 4, cardH);

      ctx.fillStyle = '#0B2239';
      ctx.font = 'bold 10px sans-serif';
      const title = `${hit.mk.prodi} ${hit.mk.semester}${hit.mk.kelas} • ${hit.mk.kode}${hit.badge ? ' ' + hit.badge : ''}`;
      ctx.fillText(title.slice(0, 24), x + 10, y + 16);

      ctx.font = '10px sans-serif';
      ctx.fillText(hit.mk.nama.slice(0, 24), x + 10, y + 30);
    });
  });

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Matriks_Jadwal_2023_2024.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * FR-E3: Self-contained offline HTML without any external CDN or http/https links.
 */
export function buildOfflineHtmlDocument(
  rooms: readonly Ruangan[],
  courses: readonly MataKuliah[],
  lecturers: readonly Dosen[],
  settings: PengaturanWaktu,
): string {
  const payload = JSON.stringify({
    rooms,
    courses: courses.filter((c) => c.statusAntrean === 'ready'),
    lecturers,
    days: ALL_DAYS.map((d) => ({
      day: d,
      slots: buildDayTimeSlots(d, settings),
    })),
    settings,
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Mind Mapping Jadwal Perkuliahan 2023/2024 — UPI Kampus Cibiru (Offline)</title>
<style>
  :root {
    --primary: #0101B7;
    --secondary: #8DCCF1;
    --accent: #FFD166;
    --neutral: #F2F7FF;
    --surface: #FFFFFF;
    --ink: #0B2239;
    --border: #DCE6F5;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--neutral); color: var(--ink); padding: 16px; }
  header { background: var(--primary); color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  h1 { margin: 0; font-size: 20px; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  button, select, input { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; background: #fff; }
  button.active { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 700; }
  .scroll { overflow: auto; max-height: 78vh; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
  table { border-collapse: separate; border-spacing: 0; width: max-content; min-width: 100%; font-size: 12px; }
  th, td { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6px 8px; vertical-align: top; }
  thead tr:nth-child(1) th { position: sticky; top: 0; background: var(--primary); color: #fff; z-index: 10; }
  thead tr:nth-child(2) th { position: sticky; top: 29px; background: #E6E8FF; color: var(--ink); z-index: 10; }
  thead tr:nth-child(3) th { position: sticky; top: 58px; background: var(--neutral); color: #475569; z-index: 10; }
  .break-row td { background: #FFF6DB; color: #B45309; font-weight: 700; text-align: center; }
  .card { padding: 6px; border-radius: 6px; border-left: 4px solid var(--primary); background: #E6E8FF; margin-bottom: 2px; }
  .card--PGSD { background: #DCFCE7; border-left-color: #15803D; }
  .card--PGPAUD { background: #FEF3C7; border-left-color: #B45309; }
  .card--RPL { background: #E6E8FF; border-left-color: #0101B7; }
  .card--PMM { background: #EDE9FE; border-left-color: #6D28D9; }
  .card--TEKKOM { background: #FFE4E6; border-left-color: #BE123C; }
  .card--MKDU { background: #E0E7FF; border-left-color: #3730A3; }
</style>
</head>
<body>
<header>
  <div>
    <h1>Mind Mapping Jadwal Perkuliahan 2023/2024 — UPI Kampus Cibiru</h1>
    <div style="font-size:12px;opacity:0.9;">Mode Offline Mandiri • Durasi SKS: ${settings.durasiSks} menit</div>
  </div>
  <div id="summary-badge" style="font-size:13px;font-weight:700;"></div>
</header>
<div class="toolbar">
  <select id="day-filter">
    <option value="ALL">Semua Hari (Senin–Sabtu)</option>
    <option value="SENIN">Senin</option>
    <option value="SELASA">Selasa</option>
    <option value="RABU">Rabu</option>
    <option value="KAMIS">Kamis</option>
    <option value="JUMAT">Jumat</option>
    <option value="SABTU">Sabtu</option>
  </select>
  <select id="building-filter">
    <option value="ALL">Semua 37 Ruangan</option>
    <option value="Gedung B">Gedung B (1–18)</option>
    <option value="Gedung E">Gedung E (19–22)</option>
    <option value="Smart Class & Lab">Smart Class & Lab (23–37)</option>
  </select>
  <input id="search-input" type="search" placeholder="Cari MK / Kode / Dosen / Kelas..." />
</div>
<div class="scroll">
  <table id="matrix-table"></table>
</div>
<script>
const DATASET = ${payload};
function prodiKey(p) {
  const u = (p || '').toUpperCase();
  if (u.includes('KOMPUTER') || u.includes('TEKKOM')) return 'TEKKOM';
  if (u === 'PGSD' || u === 'PGPAUD' || u === 'RPL' || u === 'PMM' || u === 'MKDU') return u;
  return 'RPL';
}
function render() {
  const dayFilter = document.getElementById('day-filter').value;
  const bFilter = document.getElementById('building-filter').value;
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const rooms = DATASET.rooms.filter(r => bFilter === 'ALL' || r.gedung === bFilter);
  const days = DATASET.days.filter(d => dayFilter === 'ALL' || d.day === dayFilter);
  const slotMap = {};
  let scheduledCount = 0;
  DATASET.courses.forEach(mk => {
    if (mk.segments && mk.segments.length > 0) scheduledCount++;
    (mk.segments || []).forEach(seg => {
      const text = [mk.kode, mk.nama, mk.prodi, mk.kelas, mk.kodeDosen1, mk.kodeDosen2, mk.dosen1 && mk.dosen1.nama, mk.dosen2 && mk.dosen2.nama].join(' ').toLowerCase();
      if (q && !text.includes(q)) return;
      for (let p = seg.pos; p < seg.pos + seg.len; p++) {
        slotMap[seg.day + '|' + seg.room + '|' + p] = { mk, seg, isStart: p === seg.pos };
      }
    });
  });
  document.getElementById('summary-badge').textContent = 'Terjadwal: ' + scheduledCount + ' / ' + DATASET.courses.length + ' MK';
  let html = '<thead>';
  html += '<tr><th>HARI</th><th>JAM</th><th>Pos</th>' + rooms.map(r => '<th>' + r.label + '</th>').join('') + '</tr>';
  html += '<tr><th></th><th></th><th></th>' + rooms.map(r => '<th>' + r.kode + '</th>').join('') + '</tr>';
  html += '<tr><th></th><th></th><th></th>' + rooms.map(r => '<th>' + r.urutan + '</th>').join('') + '</tr>';
  html += '</thead><tbody>';
  days.forEach(d => {
    d.slots.forEach((s, idx) => {
      if (s.isBreak) {
        html += '<tr class="break-row"><td>' + (idx === 0 ? d.day : '') + '</td><td>' + s.label + '</td><td>-</td><td colspan="' + rooms.length + '">JAM ISTIRAHAT (' + s.label + ')</td></tr>';
      } else {
        html += '<tr><td><strong>' + (idx === 0 ? d.day : '') + '</strong></td><td>' + s.label + '</td><td>' + s.pos + '</td>';
        rooms.forEach(r => {
          const hit = slotMap[d.day + '|' + r.id + '|' + s.pos];
          if (!hit) {
            html += '<td></td>';
          } else {
            const d1 = hit.mk.dosen1 ? hit.mk.dosen1.kode + ' ' + hit.mk.dosen1.nama : (hit.mk.kodeDosen1 || '-');
            const d2 = hit.mk.dosen2 ? ' / ' + hit.mk.dosen2.kode + ' ' + hit.mk.dosen2.nama : '';
            const badge = hit.seg.badgeLabel ? ' <strong>' + hit.seg.badgeLabel + '</strong>' : '';
            html += '<td><div class="card card--' + prodiKey(hit.mk.prodi) + '"><div><strong>' + hit.mk.prodi + ' ' + hit.mk.semester + hit.mk.kelas + '</strong> • ' + hit.mk.kode + badge + '</div><div>' + hit.mk.nama + ' (' + hit.seg.len + ' SKS)</div><div style="font-size:11px;color:#475569;">' + d1 + d2 + '</div></div></td>';
          }
        });
        html += '</tr>';
      }
    });
  });
  html += '</tbody>';
  document.getElementById('matrix-table').innerHTML = html;
}
document.getElementById('day-filter').addEventListener('change', render);
document.getElementById('building-filter').addEventListener('change', render);
document.getElementById('search-input').addEventListener('input', render);
render();
</script>
</body>
</html>`;
}
