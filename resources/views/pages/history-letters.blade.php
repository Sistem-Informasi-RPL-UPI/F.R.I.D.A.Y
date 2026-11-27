<x-layouts.app pageTitle="Riwayat Pengajuan Surat" activePage="letter-history" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">DOKUMEN AKADEMIK</span>
                <h1>Riwayat Pengajuan Surat</h1>
                <p>Lihat perkembangan seluruh pengajuan surat akademikmu.</p>
            </div>
            <a href="{{ route('blade.letters.create') }}" class="btn btn-primary">
                <x-icon name="file" /> Ajukan Surat
            </a>
        </div>

        <section class="history-overview letter">
            <div class="history-overview-copy">
                <span class="history-overview-icon">
                    <x-icon name="file" :size="26" />
                </span>
                <div>
                    <span class="eyebrow">PENGAJUAN SEMESTER INI</span>
                    <strong>2 pengajuan surat</strong>
                    <small>1 dokumen telah selesai diproses</small>
                </div>
            </div>
            <div class="history-mini-stats">
                <span><strong>0</strong>Menunggu</span>
                <span><strong>1</strong>Aktif</span>
                <span><strong>1</strong>Selesai</span>
            </div>
            <i class="history-orb orb-one"></i>
            <i class="history-orb orb-two"></i>
        </section>

        <div class="tabs">
            <button class="active">Semua <span>2</span></button>
            <button>Menunggu <span>0</span></button>
            <button>Sedang Ditinjau <span>1</span></button>
            <button>Selesai <span>1</span></button>
        </div>

        <div class="toolbar">
            <label class="search">
                <x-icon name="search" />
                <input placeholder="Cari jenis surat atau nomor pengajuan..." />
            </label>
        </div>

        <section class="panel history-table-panel">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Jenis Surat</th>
                            <th>Tanggal Pengajuan</th>
                            <th>Pembaruan Terakhir</th>
                            <th>Nomor Referensi</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="history-resource">
                                    <span class="history-row-icon"><x-icon name="file" /></span>
                                    <span>
                                        <strong>Surat Pengantar Magang</strong>
                                        <small>Dokumen akademik</small>
                                    </span>
                                </div>
                            </td>
                            <td>12 Jun 2025</td>
                            <td>13 Jun 2025</td>
                            <td class="mono">RPL/SRT/2025/0148</td>
                            <td><x-badge tone="info">Sedang Ditinjau</x-badge></td>
                            <td>
                                <a href="{{ route('blade.letters.detail') }}" class="btn btn-ghost">Detail</a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="history-resource">
                                    <span class="history-row-icon"><x-icon name="file" /></span>
                                    <span>
                                        <strong>Surat Keterangan Mahasiswa</strong>
                                        <small>Dokumen akademik</small>
                                    </span>
                                </div>
                            </td>
                            <td>28 Mei 2025</td>
                            <td>28 Mei 2025</td>
                            <td class="mono">RPL/SRT/2025/0121</td>
                            <td><x-badge tone="neutral">Selesai</x-badge></td>
                            <td>
                                <a href="{{ route('blade.letters.detail') }}" class="btn btn-ghost">Detail</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-layouts.app>
