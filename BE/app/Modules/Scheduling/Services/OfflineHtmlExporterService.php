<?php

namespace App\Modules\Scheduling\Services;

class OfflineHtmlExporterService
{
    /**
     * Render a 100% self-contained HTML file with inline CSS, JS, and dataset.
     * Contains zero external CDN links, API calls, or online dependencies so it works via file://.
     *
     * @param  array<string, mixed>  $matrixData
     */
    public function render(array $matrixData): string
    {
        $jsonDataset = json_encode($matrixData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
        $periodTitle = htmlspecialchars((string) ($matrixData['schedule_run']['academic_period'] ?? 'Jadwal Akademik'), ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Mind Mapping Jadwal — {$periodTitle}</title>
<style>
  :root {
    --primary: #0101B7;
    --secondary: #8DCCF1;
    --accent: #FFD166;
    --neutral: #F2F7FF;
    --surface: #FFFFFF;
    --ink: #0B2239;
    --muted: #64748B;
    --border: #DCE6F5;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--neutral);
    color: var(--ink);
  }
  header {
    background: var(--primary);
    color: #fff;
    padding: 20px 24px;
  }
  header h1 { margin: 0 0 4px; font-size: 24px; }
  header p { margin: 0; font-size: 13px; opacity: 0.9; }
  main { padding: 20px 24px; max-width: 100%; }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    background: var(--surface);
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .tabs { display: flex; flex-wrap: wrap; gap: 8px; }
  .tab {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--ink);
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
  }
  .tab.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
  input[type="search"], select {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    padding: 6px 10px;
    border-radius: 9999px;
    border: 1px solid var(--border);
    font-size: 12px;
    font-weight: 600;
  }
  .legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .matrix-wrap {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  table { border-collapse: collapse; width: 100%; min-width: 720px; font-size: 12px; }
  th, td { border: 1px solid var(--border); padding: 8px; vertical-align: top; text-align: left; }
  th { background: #E6E8FF; color: var(--ink); position: sticky; top: 0; }
  .cell-card {
    padding: 6px 8px;
    border-radius: 6px;
    border-left: 4px solid var(--primary);
    background: #F8FAFF;
  }
  .cell-card strong { display: block; font-size: 12px; }
  .cell-card span { display: block; color: var(--muted); font-size: 11px; }
</style>
</head>
<body>
<header>
  <h1>Mind Mapping Jadwal Kuliah — {$periodTitle}</h1>
  <p>Mode Offline (Self-Contained HTML) — UPI Kampus Cibiru</p>
</header>
<main>
  <div class="toolbar">
    <div id="building-tabs" class="tabs"></div>
    <select id="day-filter" aria-label="Filter Hari">
      <option value="">Semua Hari</option>
    </select>
    <input id="search-input" type="search" placeholder="Cari mata kuliah, dosen, kelas..." />
  </div>
  <div id="legend" class="legend"></div>
  <div class="matrix-wrap">
    <table id="matrix-table"></table>
  </div>
</main>
<script>
const DATASET = {$jsonDataset};
let selectedBuildingId = 'all';
let selectedDay = '';
let searchText = '';

function renderLegend() {
  const el = document.getElementById('legend');
  el.innerHTML = DATASET.legend.map(item =>
    '<span class="legend-item"><span class="legend-dot" style="background:' + item.color_hex + '"></span>' +
    item.code + ' — ' + item.name + '</span>'
  ).join('');
}

function renderFilters() {
  const tabs = document.getElementById('building-tabs');
  const allBtn = '<button class="tab ' + (selectedBuildingId === 'all' ? 'active' : '') + '" onclick="setBuilding(\'all\')">Seluruh Kampus</button>';
  const buildingBtns = DATASET.buildings.map(b =>
    '<button class="tab ' + (String(selectedBuildingId) === String(b.id) ? 'active' : '') + '" onclick="setBuilding(' + b.id + ')">' + b.code + ' — ' + b.name + '</button>'
  ).join('');
  tabs.innerHTML = allBtn + buildingBtns;

  const daySel = document.getElementById('day-filter');
  if (daySel.options.length === 1) {
    DATASET.days.forEach(d => {
      const opt = document.createElement('option');
      opt.value = String(d.day_of_week);
      opt.textContent = d.name;
      daySel.appendChild(opt);
    });
  }
}

function setBuilding(id) {
  selectedBuildingId = id;
  renderFilters();
  renderMatrix();
}

function renderMatrix() {
  const table = document.getElementById('matrix-table');
  const rooms = selectedBuildingId === 'all'
    ? DATASET.rooms
    : DATASET.rooms.filter(r => String(r.building_id) === String(selectedBuildingId));

  const days = selectedDay
    ? DATASET.days.filter(d => String(d.day_of_week) === String(selectedDay))
    : DATASET.days;

  let html = '<thead><tr><th>Hari</th><th>Jam / Slot</th>';
  rooms.forEach(r => {
    html += '<th>' + r.code + '<br><small>' + r.building_code + ' (' + r.capacity + ')</small></th>';
  });
  html += '</tr></thead><tbody>';

  days.forEach(d => {
    const daySlots = DATASET.time_slots.filter(s => s.day_of_week === d.day_of_week);
    daySlots.forEach(s => {
      html += '<tr><td><strong>' + d.name + '</strong></td><td>' + s.label + '</td>';
      rooms.forEach(r => {
        const key = d.day_of_week + ':' + s.slot_order + ':' + r.id;
        const cell = DATASET.cells[key];
        if (!cell) {
          html += '<td></td>';
          return;
        }
        const hay = (cell.course_code + ' ' + cell.course_name + ' ' + cell.lecturer_name + ' ' + cell.class_name).toLowerCase();
        if (searchText && !hay.includes(searchText)) {
          html += '<td style="opacity:0.25"></td>';
          return;
        }
        html += '<td><div class="cell-card" style="border-left-color:' + cell.color_hex + '">' +
          '<strong>' + cell.course_code + ' — ' + cell.course_name + '</strong>' +
          '<span>' + cell.class_name + ' • ' + cell.lecturer_name + '</span>' +
          '</div></td>';
      });
      html += '</tr>';
    });
  });

  html += '</tbody>';
  table.innerHTML = html;
}

document.getElementById('day-filter').addEventListener('change', function(e) {
  selectedDay = e.target.value;
  renderMatrix();
});
document.getElementById('search-input').addEventListener('input', function(e) {
  searchText = e.target.value.trim().toLowerCase();
  renderMatrix();
});

renderLegend();
renderFilters();
renderMatrix();
</script>
</body>
</html>
HTML;
    }
}
