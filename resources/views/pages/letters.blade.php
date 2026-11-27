<x-layouts.app pageTitle="Layanan Pengajuan Surat" activePage="letters" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">LAYANAN AKADEMIK</span>
                <h1>Layanan Pengajuan Surat</h1>
                <p>Pilih jenis surat yang kamu butuhkan dan lengkapi persyaratannya secara daring.</p>
            </div>
            <a href="{{ route('blade.history.letters') }}" class="btn btn-outline">
                <x-icon name="history" :size="18" /> Riwayat Surat
            </a>
        </div>

        <div class="toolbar">
            <label class="search">
                <x-icon name="search" />
                <input placeholder="Cari jenis surat..." />
            </label>
            <button type="button" class="btn btn-outline">
                <x-icon name="filter" /> Filter
            </button>
        </div>

        <div class="letter-grid">
            <article class="letter-card">
                <div class="letter-symbol symbol-0">
                    <x-icon name="file" :size="26" />
                </div>
                <div class="letter-content">
                    <span class="label">LAYANAN SURAT</span>
                    <h2>Surat Keterangan Mahasiswa</h2>
                    <p>Dokumen yang menerangkan status aktif sebagai mahasiswa untuk berbagai keperluan.</p>
                    <div class="requirement">
                        <x-icon name="check" :size="16" />
                        <span>
                            <strong>Dokumen persyaratan</strong>
                            KTM aktif, bukti registrasi semester berjalan
                        </span>
                    </div>
                </div>
                <a href="{{ route('blade.letters.create') }}" class="btn btn-outline">
                    Ajukan Surat <x-icon name="arrow" :size="16" />
                </a>
            </article>

            <article class="letter-card">
                <div class="letter-symbol symbol-1">
                    <x-icon name="file" :size="26" />
                </div>
                <div class="letter-content">
                    <span class="label">LAYANAN SURAT</span>
                    <h2>Surat Pengantar Magang</h2>
                    <p>Surat pengantar resmi untuk keperluan magang atau kerja praktik industri.</p>
                    <div class="requirement">
                        <x-icon name="check" :size="16" />
                        <span>
                            <strong>Dokumen persyaratan</strong>
                            Proposal magang, data instansi/perusahaan tujuan
                        </span>
                    </div>
                </div>
                <a href="{{ route('blade.letters.create') }}" class="btn btn-outline">
                    Ajukan Surat <x-icon name="arrow" :size="16" />
                </a>
            </article>

            <article class="letter-card">
                <div class="letter-symbol symbol-2">
                    <x-icon name="file" :size="26" />
                </div>
                <div class="letter-content">
                    <span class="label">LAYANAN SURAT</span>
                    <h2>Surat Dispensasi</h2>
                    <p>Permohonan dispensasi kehadiran untuk kegiatan akademik atau perlombaan resmi.</p>
                    <div class="requirement">
                        <x-icon name="check" :size="16" />
                        <span>
                            <strong>Dokumen persyaratan</strong>
                            Bukti kegiatan, surat undangan resmi
                        </span>
                    </div>
                </div>
                <a href="{{ route('blade.letters.create') }}" class="btn btn-outline">
                    Ajukan Surat <x-icon name="arrow" :size="16" />
                </a>
            </article>
        </div>

        <div class="note">
            <span class="soft-icon">
                <x-icon name="bell" />
            </span>
            <div>
                <strong>Perlu diketahui</strong>
                <p>Jenis layanan dan persyaratan dapat berubah sesuai kebijakan institusi. Pastikan dokumen yang diunggah terbaca jelas.</p>
            </div>
        </div>
    </div>
</x-layouts.app>
