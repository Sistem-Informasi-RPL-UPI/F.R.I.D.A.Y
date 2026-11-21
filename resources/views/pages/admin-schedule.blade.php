<x-layouts.app pageTitle="Jadwal & Ketersediaan" activePage="admin-schedule" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">KALENDER RUANG TERPUSAT</span>
                <h1>Jadwal & Ketersediaan</h1>
                <p>Pantau jadwal kuliah reguler, pemindahan pertemuan, dan peminjaman organisasi dari satu tampilan.</p>
            </div>
            <a href="{{ url('/') }}" class="btn btn-primary">
                <x-icon name="plus" /> Buka di Mode Interaktif
            </a>
        </div>

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
