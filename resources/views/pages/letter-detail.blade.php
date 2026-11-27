<x-layouts.app pageTitle="Detail Pengajuan Surat" activePage="letter-history" role="student">
    <div class="page narrow">
        <a href="{{ route('blade.history.letters') }}" class="back">
            Riwayat Pengajuan <x-icon name="chevron" :size="15" /> Detail
        </a>
        <div class="detail-hero">
            <div>
                <span class="eyebrow">RPL/SRT/2025/0148</span>
                <h1>Surat Pengantar Magang</h1>
                <p>Diajukan pada 12 Juni 2025, 09.42 WIB</p>
            </div>
            <x-badge tone="info">Sedang Ditinjau</x-badge>
        </div>

        <section class="panel timeline-panel">
            <h2>Perkembangan pengajuan</h2>
            <div class="timeline">
                <div class="active">
                    <span><x-icon name="check" :size="15" /></span>
                    <strong>Diajukan</strong>
                    <small>12 Jun, 09.42</small>
                    <i></i>
                </div>
                <div class="active">
                    <span>2</span>
                    <strong>Sedang Ditinjau</strong>
                    <small>13 Jun, 10.15</small>
                    <i></i>
                </div>
                <div>
                    <span>3</span>
                    <strong>Disetujui</strong>
                    <small>Menunggu</small>
                    <i></i>
                </div>
                <div>
                    <span>4</span>
                    <strong>Selesai</strong>
                    <small>Menunggu</small>
                </div>
            </div>
        </section>

        <div class="detail-grid">
            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h2>Informasi Pengajuan</h2>
                        <p>Data yang kamu kirimkan</p>
                    </div>
                </div>
                <dl class="data-list">
                    <div>
                        <dt>Nama mahasiswa</dt>
                        <dd>Alya Rahmadani</dd>
                    </div>
                    <div>
                        <dt>Nomor induk</dt>
                        <dd>2201024</dd>
                    </div>
                    <div>
                        <dt>Instansi tujuan</dt>
                        <dd>PT Teknologi Nusantara</dd>
                    </div>
                    <div>
                        <dt>Periode magang</dt>
                        <dd>1 Juli – 30 September 2025</dd>
                    </div>
                </dl>
            </section>

            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h2>Dokumen</h2>
                        <p>2 dokumen terlampir</p>
                    </div>
                </div>
                <div class="document">
                    <span><x-icon name="file" /></span>
                    <div>
                        <strong>Proposal_Magang_Alya.pdf</strong>
                        <small>PDF · 1.8 MB</small>
                    </div>
                    <button type="button"><x-icon name="eye" /></button>
                </div>
                <div class="document">
                    <span><x-icon name="file" /></span>
                    <div>
                        <strong>Bukti_Penerimaan.pdf</strong>
                        <small>PDF · 620 KB</small>
                    </div>
                    <button type="button"><x-icon name="eye" /></button>
                </div>
            </section>
        </div>

        <div class="note blue-note">
            <span class="soft-icon"><x-icon name="clock" /></span>
            <div>
                <strong>Pengajuan sedang diperiksa</strong>
                <p>Admin sedang memeriksa kelengkapan dokumen. Kamu akan menerima notifikasi ketika status berubah.</p>
            </div>
        </div>
    </div>
</x-layouts.app>
