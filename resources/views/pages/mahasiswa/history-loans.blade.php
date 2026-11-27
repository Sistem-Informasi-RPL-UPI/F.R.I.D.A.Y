<x-layouts.app pageTitle="Riwayat Peminjaman" activePage="loan-history" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">AKTIVITAS LABORATORIUM</span>
                <h1>Riwayat Peminjaman</h1>
                <p>Pantau status dan jadwal seluruh permohonan peminjamanmu.</p>
            </div>
            <a href="{{ route('mahasiswa.peminjaman') }}" class="btn btn-primary">
                <x-icon name="box" /> Ajukan Peminjaman
            </a>
        </div>

        <section class="history-overview loan">
            <div class="history-overview-copy">
                <span class="history-overview-icon">
                    <x-icon name="calendar" :size="26" />
                </span>
                <div>
                    <span class="eyebrow">PEMINJAMAN SEMESTER INI</span>
                    <strong>5 peminjaman</strong>
                    <small>3 permohonan telah disetujui / berhasil</small>
                </div>
            </div>
            <div class="history-mini-stats">
                <span><strong>2</strong>Menunggu</span>
                <span><strong>3</strong>Disetujui</span>
                <span><strong>0</strong>Ditolak</span>
            </div>
            <i class="history-orb orb-one"></i>
            <i class="history-orb orb-two"></i>
        </section>

        <section class="panel history-table-panel">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Jadwal</th>
                            <th>Lokasi</th>
                            <th>Nomor Referensi</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="history-resource">
                                    <span class="history-row-icon loan"><x-icon name="grid" /></span>
                                    <span>
                                        <strong>Laboratorium Multimedia</strong>
                                        <small>Ruangan</small>
                                    </span>
                                </div>
                            </td>
                            <td><strong>18 Jun 2025 · 10:00–12:00</strong></td>
                            <td>Gedung RPL, Lantai 2</td>
                            <td class="mono">RPL/PJM/2025/0092</td>
                            <td><x-badge tone="success">Disetujui</x-badge></td>
                        </tr>
                        <tr>
                            <td>
                                <div class="history-resource">
                                    <span class="history-row-icon loan"><x-icon name="box" /></span>
                                    <span>
                                        <strong>Kamera Sony Alpha A6400</strong>
                                        <small>Barang · 1 unit</small>
                                    </span>
                                </div>
                            </td>
                            <td><strong>20 Jun 2025 – 22 Jun 2025</strong></td>
                            <td>Laboratorium Multimedia</td>
                            <td class="mono">RPL/PJM/2025/0087</td>
                            <td><x-badge tone="warning">Menunggu</x-badge></td>
                        </tr>
                        <tr>
                            <td>
                                <div class="history-resource">
                                    <span class="history-row-icon loan"><x-icon name="grid" /></span>
                                    <span>
                                        <strong>Laboratorium RPL (B.01.004)</strong>
                                        <small>Ruangan · Kuliah</small>
                                    </span>
                                </div>
                            </td>
                            <td><strong>25 Jun 2025 · 13:00–15:00</strong></td>
                            <td>Gedung Biru, Lantai 1</td>
                            <td class="mono">RPL/PJM/2025/0093</td>
                            <td><x-badge tone="success">Berhasil</x-badge></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-layouts.app>
