<x-layouts.app pageTitle="Dashboard Admin" activePage="admin-dashboard" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">RABU, 18 JUNI 2025</span>
                <h1>Selamat pagi, Dimas</h1>
                <p>Berikut ringkasan layanan administrasi yang memerlukan perhatianmu.</p>
            </div>
            <a href="{{ route('admin.data-surat') }}" class="btn btn-primary">
                Tinjau pengajuan <x-icon name="arrow" :size="16" />
            </a>
        </div>

        <section class="stats">
            <x-stat-card icon="clock" label="Menunggu Ditinjau" value="14" note="+4 sejak kemarin" tone="yellow" />
            <x-stat-card icon="file" label="Diproses Hari Ini" value="8" note="Dari 22 pengajuan" tone="blue" />
            <x-stat-card icon="check" label="Selesai Bulan Ini" value="126" note="+12% dari Mei" tone="green" />
            <x-stat-card icon="chart" label="Rata-rata Proses" value="1.8h" note="Lebih cepat 14 menit" tone="sky" />
        </section>

        <div class="admin-priority">
            <div>
                <span class="eyebrow">PRIORITAS HARI INI</span>
                <h2>4 pengajuan menunggu lebih dari 24 jam</h2>
                <p>Periksa pengajuan tertua terlebih dahulu untuk menjaga waktu layanan.</p>
            </div>
            <a href="{{ route('admin.data-surat') }}" class="btn btn-secondary">
                Lihat Prioritas <x-icon name="arrow" :size="16" />
            </a>
        </div>

        <div class="content-grid">
            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h2>Menunggu Peninjauan</h2>
                        <p>Pengajuan terbaru yang perlu diperiksa</p>
                    </div>
                    <a href="{{ route('admin.data-surat') }}" class="btn btn-ghost">Lihat semua</a>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Tanggal</th>
                                <th>Aktivitas</th>
                                <th>Nomor Referensi</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Nadia Putri</strong></td>
                                <td>18 Jun 2025</td>
                                <td><strong>Ruang Seminar (B.02.003)</strong></td>
                                <td class="mono">RPL/PJM/2025/0094</td>
                                <td><x-badge tone="warning">Menunggu</x-badge></td>
                            </tr>
                            <tr>
                                <td><strong>Rizky Maulana</strong></td>
                                <td>18 Jun 2025</td>
                                <td><strong>Surat Rekomendasi Lomba</strong></td>
                                <td class="mono">RPL/SRT/2025/0150</td>
                                <td><x-badge tone="info">Sedang Ditinjau</x-badge></td>
                            </tr>
                            <tr>
                                <td><strong>Bagas Saputra</strong></td>
                                <td>17 Jun 2025</td>
                                <td><strong>Ruang Kolaborasi (A.02.005)</strong></td>
                                <td class="mono">RPL/PJM/2025/0096</td>
                                <td><x-badge tone="warning">Menunggu</x-badge></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <aside class="panel">
                <div class="panel-head">
                    <div>
                        <h2>Komposisi Status</h2>
                        <p>Pengajuan bulan Juni</p>
                    </div>
                </div>
                <div class="donut">
                    <div>
                        <strong>148</strong>
                        <span>Total</span>
                    </div>
                </div>
                <div class="legend">
                    <span><i class="l-blue"></i> Selesai <b>68%</b></span>
                    <span><i class="l-yellow"></i> Diproses <b>22%</b></span>
                    <span><i class="l-sky"></i> Menunggu <b>10%</b></span>
                </div>
            </aside>
        </div>
    </div>
</x-layouts.app>
