<x-layouts.app pageTitle="Peminjaman Barang & Ruangan" activePage="resources" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">LABORATORIUM RPL</span>
                <h1>Peminjaman Barang & Ruangan</h1>
                <p>Temukan barang atau ruangan laboratorium, lalu cek ketersediaannya sebelum mengajukan.</p>
            </div>
            <a href="{{ route('blade.history.loans') }}" class="btn btn-outline">
                <x-icon name="history" /> Riwayat Peminjaman
            </a>
        </div>

        <div class="resource-tools">
            <div class="segmented">
                <button type="button" class="active">
                    <x-icon name="box" /> Barang
                </button>
                <button type="button" onclick="alert('Buka mode denah interaktif lengkap di versi React SPA!')">
                    <x-icon name="grid" /> Ruangan (Denah)
                </button>
            </div>
            <div class="toolbar">
                <label class="search">
                    <x-icon name="search" />
                    <input placeholder="Cari barang..." />
                </label>
            </div>
        </div>

        <div class="filter-row">
            <button type="button" class="btn btn-outline"><x-icon name="filter" /> Semua kategori</button>
            <button type="button" class="btn btn-outline"><x-icon name="calendar" /> 18 Juni 2025</button>
            <button type="button" class="btn btn-outline">Semua ketersediaan</button>
        </div>

        <div class="resource-grid">
            <article class="resource-card">
                <div class="resource-image resource-0">
                    <span class="resource-placeholder">
                        <x-icon name="box" :size="40" />
                    </span>
                    <x-badge tone="success">Tersedia</x-badge>
                </div>
                <div class="resource-body">
                    <span class="label">PERALATAN MULTIMEDIA</span>
                    <h2>Kamera Sony Alpha A6400</h2>
                    <p><x-icon name="settings" :size="16" /> Lab Multimedia</p>
                    <div class="availability">
                        <span>Ketersediaan</span>
                        <strong>3 dari 5 unit</strong>
                    </div>
                    <a href="{{ route('blade.history.loans') }}" class="btn btn-outline">
                        Pinjam Barang <x-icon name="arrow" :size="16" />
                    </a>
                </div>
            </article>

            <article class="resource-card">
                <div class="resource-image resource-1">
                    <span class="resource-placeholder">
                        <x-icon name="box" :size="40" />
                    </span>
                    <x-badge tone="danger">Tidak tersedia</x-badge>
                </div>
                <div class="resource-body">
                    <span class="label">PERALATAN PRAKTIKUM</span>
                    <h2>Kit Internet of Things</h2>
                    <p><x-icon name="settings" :size="16" /> Lab IoT</p>
                    <div class="availability">
                        <span>Ketersediaan</span>
                        <strong>0 dari 8 unit</strong>
                    </div>
                    <button type="button" class="btn btn-outline" disabled>
                        Sedang Dipinjam
                    </button>
                </div>
            </article>

            <article class="resource-card">
                <div class="resource-image resource-0">
                    <span class="resource-placeholder">
                        <x-icon name="grid" :size="40" />
                    </span>
                    <x-badge tone="success">Tersedia</x-badge>
                </div>
                <div class="resource-body">
                    <span class="label">RUANG PRAKTIKUM</span>
                    <h2>Laboratorium RPL (B.01.004)</h2>
                    <p><x-icon name="grid" :size="16" /> Gedung Biru, Lantai 1</p>
                    <div class="availability">
                        <span>Kapasitas</span>
                        <strong>32 orang</strong>
                    </div>
                    <a href="{{ url('/') }}" class="btn btn-outline">
                        Pilih di Denah Interaktif <x-icon name="arrow" :size="16" />
                    </a>
                </div>
            </article>
        </div>
    </div>
</x-layouts.app>
