<x-layouts.app pageTitle="Notifikasi" activePage="notifications" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">PUSAT AKTIVITAS</span>
                <h1>Notifikasi</h1>
                <p>Ikuti setiap perkembangan layanan akademik dan peminjamanmu.</p>
            </div>
            <button type="button" class="btn btn-outline">
                <x-icon name="check" /> Tandai semua dibaca
            </button>
        </div>

        <section class="notification-banner">
            <div>
                <span class="notification-hero-icon">
                    <x-icon name="bell" :size="28" />
                </span>
                <div>
                    <span class="eyebrow">RINGKASAN HARI INI</span>
                    <h2>2 informasi baru untukmu</h2>
                    <p>Perubahan dari mahasiswa dan admin langsung tercatat di halaman ini.</p>
                </div>
            </div>
            <span class="notification-date">
                <strong>18</strong>JUN 2025
            </span>
            <i></i><i></i>
        </section>

        <div class="notification-layout">
            <aside class="notification-filter">
                <span class="nav-label">FILTER NOTIFIKASI</span>
                <button type="button" class="active">
                    <x-icon name="bell" />
                    <span>Semua</span>
                    <b>3</b>
                </button>
                <button type="button">
                    <x-icon name="eye" />
                    <span>Belum dibaca</span>
                    <b>2</b>
                </button>
                <button type="button">
                    <x-icon name="file" />
                    <span>Pengajuan Surat</span>
                </button>
                <button type="button">
                    <x-icon name="box" />
                    <span>Peminjaman</span>
                </button>
                <button type="button">
                    <x-icon name="settings" />
                    <span>Informasi</span>
                </button>
            </aside>

            <section class="notification-list">
                <div class="notification-list-head">
                    <div>
                        <h2>Terbaru</h2>
                        <p>Notifikasi dari 30 hari terakhir</p>
                    </div>
                    <button type="button" class="btn btn-ghost">Atur notifikasi</button>
                </div>

                <article class="notification-item unread">
                    <span class="notification-item-icon success">
                        <x-icon name="box" />
                    </span>
                    <div>
                        <strong>Peminjaman ruangan disetujui</strong>
                        <p>Permohonan Laboratorium Multimedia pada 18 Juni 2025 telah disetujui.</p>
                        <small>12 menit lalu</small>
                    </div>
                    <i></i>
                    <button type="button" aria-label="Buka notifikasi"><x-icon name="chevron" :size="18" /></button>
                </article>

                <article class="notification-item unread">
                    <span class="notification-item-icon primary">
                        <x-icon name="file" />
                    </span>
                    <div>
                        <strong>Pengajuan surat sedang ditinjau</strong>
                        <p>Surat Pengantar Magang sedang diperiksa oleh admin layanan.</p>
                        <small>2 jam lalu</small>
                    </div>
                    <i></i>
                    <button type="button" aria-label="Buka notifikasi"><x-icon name="chevron" :size="18" /></button>
                </article>

                <article class="notification-item">
                    <span class="notification-item-icon sky">
                        <x-icon name="bell" />
                    </span>
                    <div>
                        <strong>Penyesuaian jam layanan</strong>
                        <p>Layanan administrasi hari Jumat tersedia hingga pukul 15.00 WIB.</p>
                        <small>Kemarin</small>
                    </div>
                    <button type="button" aria-label="Buka notifikasi"><x-icon name="chevron" :size="18" /></button>
                </article>
            </section>
        </div>
    </div>
</x-layouts.app>
