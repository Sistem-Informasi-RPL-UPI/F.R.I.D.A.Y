<x-layouts.app pageTitle="Jadwal & Ketersediaan" activePage="admin-schedule" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">KALENDER RUANG & INTEGRATOR TERPUSAT</span>
                <h1>Jadwal & Ketersediaan</h1>
                <p>Integrasikan template perkuliahan tiap kaprodi, atur prioritas & hari khusus dosen, generate Mind Mapping, serta pantau kalender ketersediaan ruangan.</p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="{{ route('admin.schedule.download-template') }}" class="btn btn-outline" download>
                    <x-icon name="download" /> Unduh Template Kaprodi (CSV)
                </a>
                <a href="{{ route('blade.admin.mind-mapping') }}" class="btn btn-secondary">
                    <x-icon name="grid" /> Mind Mapping Kampus
                </a>
                <a href="{{ url('/') }}" class="btn btn-primary">
                    <x-icon name="plus" /> Buka di Mode Interaktif
                </a>
            </div>
        </div>

        <!-- Integrator Banner -->
        <section class="panel" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1px solid #bfdbfe; margin-bottom: 24px; padding: 20px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="background: #2563eb; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: bold;">⚡</span>
                        <h2 style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin: 0;">Integrasi Template Kaprodi &amp; Mind Mapping Generator</h2>
                    </div>
                    <p style="color: #475569; font-size: 13px; margin: 4px 0 12px; max-width: 850px;">
                        Setiap kaprodi mengisi format template CSV terstandar yang sama. Anda dapat menggabungkan file template seluruh prodi, menentukan pembatasan hari tertentu dosen pengampu (misal hanya hari Senin &amp; Rabu), dan menjalankan mesin penjadwalan cerdas berbasis prioritas SKS serta bebas bentrok 100%.
                    </p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;">
                            ✓ Prioritas SKS Matkul Terbanyak (4 SKS &gt; 3 SKS &gt; 2 SKS)
                        </span>
                        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;">
                            ✓ Prioritas Dosen Beban SKS Tertinggi
                        </span>
                        <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;">
                            ✓ Validasi Team-Teaching (2 Dosen Pengampu)
                        </span>
                        <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600;">
                            ✓ Kunci Hari Khusus Dosen (100% Bebas Tabrakan)
                        </span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="{{ url('/') }}" class="btn btn-primary" style="white-space: nowrap;">
                        <x-icon name="plus" /> Buka Generator Interaktif
                    </a>
                    <a href="{{ route('admin.schedule.download-template') }}" class="btn btn-outline" style="white-space: nowrap;" download>
                        <x-icon name="download" /> Unduh Format Template
                    </a>
                </div>
            </div>
        </section>

        <div class="schedule-admin-stats">
            <x-stat-card icon="calendar" tone="blue" label="Jadwal reguler" value="16" note="Seluruh program studi" />
            <x-stat-card icon="arrow" tone="sky" label="Pemindahan kelas" value="2" note="Sementara & permanen" />
            <x-stat-card icon="clock" tone="yellow" label="Menunggu persetujuan" value="3" note="Perlu keputusan admin" />
        </div>

        <div class="program-filter">
            <span>Filter program studi</span>
            <div>
                <button type="button" class="active">Semua prodi</button>
                <button type="button">RPL</button>
                <button type="button">PGSD</button>
                <button type="button">PGPAUD</button>
                <button type="button">PMM</button>
                <button type="button">TEKKOM</button>
            </div>
        </div>

        <section class="panel admin-calendar-panel">
            <div class="panel-head">
                <div>
                    <h2>Jadwal perkuliahan reguler</h2>
                    <p>Sumber utama validasi jadwal asal mahasiswa</p>
                </div>
                <x-badge tone="info">Database akademik</x-badge>
            </div>
            <div class="admin-week-grid">
                <div class="admin-day">
                    <div class="admin-day-head">
                        <strong>Senin</strong>
                        <span>3 kelas</span>
                    </div>
                    <article>
                        <span>08:00–10:00</span>
                        <b>PGSD</b>
                        <strong>Pendidikan Matematika</strong>
                        <small>PGSD 3B · B.02.003</small>
                        <small>Dosen F</small>
                    </article>
                    <article>
                        <span>13:00–16:00</span>
                        <b>RPL</b>
                        <strong>Rekayasa Kebutuhan</strong>
                        <small>RPL 2B · A.01.003</small>
                        <small>Dosen C</small>
                    </article>
                </div>
                <div class="admin-day">
                    <div class="admin-day-head">
                        <strong>Selasa</strong>
                        <span>3 kelas</span>
                    </div>
                    <article>
                        <span>08:00–10:00</span>
                        <b>RPL</b>
                        <strong>Pemrograman Web</strong>
                        <small>RPL 3A · B.01.001</small>
                        <small>Dosen A</small>
                    </article>
                </div>
                <div class="admin-day">
                    <div class="admin-day-head">
                        <strong>Rabu</strong>
                        <span>3 kelas</span>
                    </div>
                    <article>
                        <span>08:00–10:00</span>
                        <b>RPL</b>
                        <strong>Basis Data</strong>
                        <small>RPL 3A · B.02.002</small>
                        <small>Dosen B</small>
                    </article>
                </div>
                <div class="admin-day">
                    <div class="admin-day-head">
                        <strong>Kamis</strong>
                        <span>2 kelas</span>
                    </div>
                    <article>
                        <span>10:00–12:00</span>
                        <b>RPL</b>
                        <strong>Interaksi Manusia Komputer</strong>
                        <small>RPL 3B · N.01.005</small>
                        <small>Dosen D</small>
                    </article>
                </div>
                <div class="admin-day">
                    <div class="admin-day-head">
                        <strong>Jumat</strong>
                        <span>2 kelas</span>
                    </div>
                    <article>
                        <span>13:00–15:00</span>
                        <b>PGPAUD</b>
                        <strong>Seni Anak Usia Dini</strong>
                        <small>PGPAUD 1B · N.01.006</small>
                        <small>Dosen J</small>
                    </article>
                </div>
            </div>
        </section>
    </div>
</x-layouts.app>
