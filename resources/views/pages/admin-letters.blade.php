<x-layouts.app pageTitle="Data Pengajuan Surat" activePage="admin-letters" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <h1>Data Pengajuan Surat</h1>
                <p>Tinjau informasi dan kelengkapan dokumen sebelum memberi keputusan.</p>
            </div>
        </div>

        <div class="tabs">
            <button class="active">Semua <span>3</span></button>
            <button>Menunggu <span>1</span></button>
            <button>Disetujui <span>1</span></button>
            <button>Ditolak <span>0</span></button>
        </div>

        <div class="toolbar">
            <label class="search">
                <x-icon name="search" />
                <input placeholder="Cari surat atau nama mahasiswa..." />
            </label>
        </div>

        <div class="review-layout">
            <section class="panel request-list">
                <button class="active">
                    <div class="avatar small">AR</div>
                    <div>
                        <strong>Alya Rahmadani</strong>
                        <span>Surat Pengantar Magang</span>
                        <small>RPL/SRT/2025/0148 · 12 Jun 2025</small>
                    </div>
                    <x-badge tone="info">Sedang Ditinjau</x-badge>
                    <x-icon name="chevron" />
                </button>
            </section>

            <section class="panel review-detail">
                <div class="review-head">
                    <div>
                        <span class="eyebrow">RPL/SRT/2025/0148</span>
                        <h2>Surat Pengantar Magang</h2>
                        <p>Diajukan 12 Jun 2025</p>
                    </div>
                    <x-badge tone="info">Sedang Ditinjau</x-badge>
                </div>

                <div class="student-card">
                    <div class="avatar">AR</div>
                    <div>
                        <strong>Alya Rahmadani</strong>
                        <span>2201024 · Rekayasa Perangkat Lunak</span>
                    </div>
                </div>

                <h3>Informasi pengajuan</h3>
                <dl class="data-list compact">
                    <div>
                        <dt>Instansi tujuan</dt>
                        <dd>PT Teknologi Nusantara</dd>
                    </div>
                    <div>
                        <dt>Periode</dt>
                        <dd>1 Juli 2025 – 30 September 2025</dd>
                    </div>
                </dl>

                <h3>Kelengkapan dokumen</h3>
                <label class="doc-check">
                    <input type="checkbox" checked />
                    <span>
                        <strong>Proposal magang</strong>Proposal_Magang_Alya.pdf · 1.8 MB
                    </span>
                    <x-icon name="eye" />
                </label>
                <label class="doc-check">
                    <input type="checkbox" checked />
                    <span>
                        <strong>Bukti penerimaan</strong>Bukti_Penerimaan.pdf · 620 KB
                    </span>
                    <x-icon name="eye" />
                </label>

                <div class="review-actions">
                    <button type="button" class="btn btn-danger">Tolak</button>
                    <button type="button" class="btn btn-outline"><x-icon name="clock" /> Tinjau</button>
                    <button type="button" class="btn btn-primary"><x-icon name="check" /> Setujui Pengajuan</button>
                </div>
            </section>
        </div>
    </div>
</x-layouts.app>
