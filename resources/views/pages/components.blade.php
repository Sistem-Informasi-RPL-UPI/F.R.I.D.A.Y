<x-layouts.app pageTitle="Komponen UI" activePage="components" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <h1>Komponen UI</h1>
                <p>Fondasi antarmuka Sistem Informasi RPL untuk pengalaman yang konsisten.</p>
            </div>
        </div>

        <section class="component-section">
            <h2>Warna & Tipografi</h2>
            <div class="swatches">
                <div class="swatch primary">
                    <span></span>
                    <strong>Vibrant Blue</strong>
                    <small>#1800C8</small>
                </div>
                <div class="swatch dreamy">
                    <span></span>
                    <strong>Dreamy</strong>
                    <small>#8CCFF1</small>
                </div>
                <div class="swatch warmy">
                    <span></span>
                    <strong>Warmy</strong>
                    <small>#FFD166</small>
                </div>
                <div class="swatch alice">
                    <span></span>
                    <strong>Alice</strong>
                    <small>#F3F7FF</small>
                </div>
            </div>
        </section>

        <section class="component-section">
            <h2>Tombol</h2>
            <div class="component-row">
                <button type="button" class="btn btn-primary">Primary Button</button>
                <button type="button" class="btn btn-secondary">Secondary</button>
                <button type="button" class="btn btn-outline">Outline</button>
                <button type="button" class="btn btn-ghost">Text Button</button>
                <button type="button" class="btn btn-danger">Destructive</button>
            </div>
        </section>

        <section class="component-section">
            <h2>Status badges</h2>
            <div class="component-row">
                <x-badge tone="info">Sedang Ditinjau</x-badge>
                <x-badge tone="warning">Menunggu</x-badge>
                <x-badge tone="success">Disetujui</x-badge>
                <x-badge tone="danger">Ditolak</x-badge>
                <x-badge tone="neutral">Selesai</x-badge>
            </div>
        </section>
    </div>
</x-layouts.app>
