<x-layouts.app pageTitle="Dashboard" activePage="dashboard" role="student">
    <div class="page">
        <section class="welcome">
            <div>
                <span class="eyebrow">RABU, 18 JUNI 2025</span>
                <h1>Halo, Alya Rahmadani</h1>
                <p>Pantau layanan administrasi dan peminjaman laboratoriummu dalam satu tempat.</p>
            </div>
            <div class="welcome-art">
                <span></span>
                <span></span>
                <x-icon name="file" :size="38" />
            </div>
        </section>

        <section class="stats">
            <x-stat-card icon="file" label="Pengajuan Surat Aktif" value="2" note="Tersinkron dengan admin" tone="blue" />
            <x-stat-card icon="check" label="Surat Selesai" value="1" note="Semester ini" tone="green" />
            <x-stat-card icon="box" label="Peminjaman Aktif" value="2" note="Jadwal terkonfirmasi" tone="sky" />
            <x-stat-card icon="clock" label="Menunggu Persetujuan" value="3" note="Perlu ditinjau admin" tone="yellow" />
        </section>

        <section class="quick-actions">
            <div>
                <span class="eyebrow">AKSES CEPAT</span>
                <h2>Apa yang ingin kamu lakukan?</h2>
                <p>Mulai pengajuan baru dengan memilih layanan di samping.</p>
            </div>
            <a href="{{ route('blade.letters') }}" class="action-card primary-action">
                <span class="action-icon">
                    <x-icon name="file" />
                </span>
                <span>
                    <strong>Ajukan Surat</strong>
                    <small>Buat pengajuan surat akademik baru</small>
                </span>
                <x-icon name="arrow" />
            </a>
            <a href="{{ route('blade.resources') }}" class="action-card">
                <span class="action-icon">
                    <x-icon name="box" />
                </span>
                <span>
                    <strong>Pinjam Barang / Ruangan</strong>
                    <small>Cek jadwal dan ketersediaan lab</small>
                </span>
                <x-icon name="arrow" />
            </a>
        </section>

        <div class="content-grid">
            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h2>Aktivitas Terbaru</h2>
                        <p>Perkembangan layanan terakhirmu</p>
                    </div>
                    <a href="{{ route('blade.history.letters') }}" class="btn btn-ghost">
                        Lihat semua <x-icon name="arrow" :size="16" />
                    </a>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Aktivitas</th>
                                <th>Nomor Referensi</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>12 Jun 2025</td>
                                <td><strong>Surat Pengantar Magang</strong></td>
                                <td class="mono">RPL/SRT/2025/0148</td>
                                <td><x-badge tone="info">Sedang Ditinjau</x-badge></td>
                                <td><a href="{{ route('blade.letters.detail') }}" class="row-action" aria-label="Lihat detail"><x-icon name="chevron" :size="18" /></a></td>
                            </tr>
                            <tr>
                                <td>18 Jun 2025</td>
                                <td><strong>Laboratorium Multimedia</strong></td>
                                <td class="mono">RPL/PJM/2025/0092</td>
                                <td><x-badge tone="success">Disetujui</x-badge></td>
                                <td><a href="{{ route('blade.history.loans') }}" class="row-action" aria-label="Lihat detail"><x-icon name="chevron" :size="18" /></a></td>
                            </tr>
                            <tr>
                                <td>20 Jun 2025</td>
                                <td><strong>Kamera Sony Alpha A6400</strong></td>
                                <td class="mono">RPL/PJM/2025/0087</td>
                                <td><x-badge tone="warning">Menunggu</x-badge></td>
                                <td><a href="{{ route('blade.history.loans') }}" class="row-action" aria-label="Lihat detail"><x-icon name="chevron" :size="18" /></a></td>
                            </tr>
                            <tr>
                                <td>28 Mei 2025</td>
                                <td><strong>Surat Keterangan Mahasiswa</strong></td>
                                <td class="mono">RPL/SRT/2025/0121</td>
                                <td><x-badge tone="neutral">Selesai</x-badge></td>
                                <td><a href="{{ route('blade.letters.detail') }}" class="row-action" aria-label="Lihat detail"><x-icon name="chevron" :size="18" /></a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <aside class="panel info-panel">
                <div class="panel-head">
                    <div>
                        <h2>Informasi</h2>
                        <p>Pengumuman untukmu</p>
                    </div>
                    <span class="soft-icon">
                        <x-icon name="bell" />
                    </span>
                </div>
                <div class="announcement">
                    <span class="announcement-date">17 JUN</span>
                    <div>
                        <strong>Penyesuaian jam layanan</strong>
                        <p>Layanan administrasi hari Jumat tersedia hingga pukul 15.00 WIB.</p>
                        <button type="button">Baca selengkapnya</button>
                    </div>
                </div>
                <div class="announcement">
                    <span class="announcement-date blue-date">14 JUN</span>
                    <div>
                        <strong>Pengembalian alat laboratorium</strong>
                        <p>Pastikan barang dikembalikan sesuai jadwal dan dalam kondisi baik.</p>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</x-layouts.app>
