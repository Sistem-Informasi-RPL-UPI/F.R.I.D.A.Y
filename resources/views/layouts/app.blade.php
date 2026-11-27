<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Sistem Informasi RPL' }}</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
</head>
<body>
    @php
        $role = $role ?? 'student';
        $activePage = $activePage ?? 'dashboard';
        
        $studentNav = [
            ['id' => 'dashboard', 'route' => 'blade.dashboard', 'label' => 'Dashboard', 'icon' => 'grid'],
            ['id' => 'letters', 'route' => 'blade.letters', 'label' => 'Layanan Pengajuan Surat', 'icon' => 'file'],
            ['id' => 'resources', 'route' => 'blade.resources', 'label' => 'Peminjaman Barang & Ruangan', 'icon' => 'box'],
            ['id' => 'letter-history', 'route' => 'blade.history.letters', 'label' => 'Riwayat Pengajuan', 'icon' => 'history'],
            ['id' => 'loan-history', 'route' => 'blade.history.loans', 'label' => 'Riwayat Peminjaman', 'icon' => 'calendar'],
            ['id' => 'notifications', 'route' => 'blade.notifications', 'label' => 'Notifikasi', 'icon' => 'bell'],
            ['id' => 'settings', 'route' => 'blade.settings', 'label' => 'Pengaturan akun', 'icon' => 'settings'],
        ];

        $adminNav = [
            ['id' => 'admin-dashboard', 'route' => 'blade.admin.dashboard', 'label' => 'Dashboard Admin', 'icon' => 'grid'],
            ['id' => 'admin-letters', 'route' => 'blade.admin.letters', 'label' => 'Data Pengajuan Surat', 'icon' => 'file'],
            ['id' => 'admin-resources', 'route' => 'blade.admin.resources', 'label' => 'Manajemen Barang & Ruangan', 'icon' => 'box'],
            ['id' => 'admin-schedule', 'route' => 'blade.admin.schedule', 'label' => 'Jadwal dan Ketersediaan', 'icon' => 'clock'],
            ['id' => 'components', 'route' => 'blade.components', 'label' => 'Komponen UI', 'icon' => 'chart'],
        ];

        $navItems = $role === 'student' ? $studentNav : $adminNav;
    @endphp

    <div class="app-shell" id="appShell">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-head">
                <div class="brand">
                    <div class="brand-mark">
                        <span>R</span>
                    </div>
                    <div>
                        <strong>Sistem Informasi</strong>
                        <span>Rekayasa Perangkat Lunak</span>
                    </div>
                </div>
                <button type="button" class="icon-btn mobile-only" onclick="toggleSidebar()" aria-label="Tutup menu">
                    <x-icon name="x" />
                </button>
            </div>
            
            <span class="nav-label">MENU UTAMA</span>
            <nav>
                @foreach ($navItems as $item)
                    <a
                        href="{{ route($item['route']) }}"
                        class="nav-item {{ $activePage === $item['id'] ? 'active' : '' }}"
                    >
                        <x-icon :name="$item['icon']" />
                        <span>{{ $item['label'] }}</span>
                        @if ($item['id'] === 'notifications')
                            <i>3</i>
                        @endif
                    </a>
                @endforeach
            </nav>

            <div class="sidebar-help">
                <div class="help-icon">?</div>
                <strong>Butuh bantuan?</strong>
                <span>Hubungi pusat layanan akademik.</span>
                <button type="button" class="btn btn-outline">Pusat Bantuan</button>
            </div>

            <a href="{{ route('blade.login') }}" class="logout">
                <x-icon name="logout" />
                <span>Keluar</span>
            </a>
        </aside>

        <button type="button" class="scrim" id="scrim" onclick="toggleSidebar()" aria-label="Tutup menu"></button>

        <div class="app-main">
            <header class="topbar">
                <div class="topbar-title">
                    <button type="button" class="icon-btn mobile-only" onclick="toggleSidebar()" aria-label="Buka menu">
                        <x-icon name="menu" />
                    </button>
                    <div>
                        <span>Sistem Informasi RPL</span>
                        <strong>{{ $pageTitle ?? 'Dashboard' }}</strong>
                    </div>
                </div>
                <div class="header-actions">
                    <a href="{{ $role === 'student' ? route('blade.admin.dashboard') : route('blade.dashboard') }}" class="role-switch">
                        {{ $role === 'student' ? 'Mode Mahasiswa' : 'Mode Admin' }}
                        <x-icon name="chevron" :size="15" />
                    </a>
                    <a href="{{ route('blade.notifications') }}" class="icon-btn notification" aria-label="Notifikasi">
                        <x-icon name="bell" />
                        <i></i>
                    </a>
                    <div class="profile">
                        <div class="avatar">{{ $role === 'student' ? 'AR' : 'DP' }}</div>
                        <div>
                            <strong>{{ $role === 'student' ? 'Alya Rahmadani' : 'Dimas Pratama' }}</strong>
                            <span>{{ $role === 'student' ? 'Mahasiswa · 2201024' : 'Admin Layanan' }}</span>
                        </div>
                        <x-icon name="chevron" :size="16" />
                    </div>
                </div>
            </header>

            <main>
                {{ $slot }}
            </main>
        </div>

        <a href="{{ url('/') }}" class="login-preview" title="Buka Mode React SPA">
            <x-icon name="grid" :size="18" />
        </a>
    </div>

    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const scrim = document.getElementById('scrim');
            if (sidebar && scrim) {
                sidebar.classList.toggle('sidebar-open');
                scrim.style.display = sidebar.classList.contains('sidebar-open') ? 'block' : 'none';
            }
        }
    </script>
</body>
</html>
