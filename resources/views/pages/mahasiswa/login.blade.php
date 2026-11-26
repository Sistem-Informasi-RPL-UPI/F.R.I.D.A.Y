<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Masuk · Sistem Informasi RPL</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css'])
</head>
<body>
    <div class="login-page">
        <aside class="login-brand">
            <div class="brand">
                <div class="brand-mark">
                    <span>R</span>
                </div>
                <div>
                    <strong>Sistem Informasi</strong>
                    <span>Rekayasa Perangkat Lunak</span>
                </div>
            </div>

            <div class="login-message">
                <span class="eyebrow">PORTAL AKADEMIK TERPADU</span>
                <h1>Satu pintu untuk semua layanan akademikmu.</h1>
                <p>Ajukan surat keterangan, kelola peminjaman laboratorium, dan pantau status permohonan secara transparan.</p>

                <div class="login-features">
                    <span>
                        <x-icon name="check" class="icon" /> Layanan Cepat
                    </span>
                    <span>
                        <x-icon name="check" class="icon" /> Transparan
                    </span>
                    <span>
                        <x-icon name="check" class="icon" /> Terintegrasi
                    </span>
                </div>
            </div>

            <div class="login-shape shape-one"></div>
            <div class="login-shape shape-two"></div>
        </aside>

        <main class="login-form-wrap">
            <div class="login-mobile-logo">
                <div class="brand">
                    <div class="brand-mark">
                        <span>R</span>
                    </div>
                    <div>
                        <strong>Sistem Informasi</strong>
                        <span>Rekayasa Perangkat Lunak</span>
                    </div>
                </div>
            </div>

            <form class="login-card" action="{{ route('mahasiswa.dashboard') }}" method="GET">
                <span class="eyebrow">SELAMAT DATANG KEMBALI</span>
                <h2>Masuk ke Akun</h2>
                <p>Gunakan akun Single Sign-On (SSO) institusimu.</p>

                <label class="field">
                    <span>NIM / NIP / Email <b>*</b></span>
                    <input type="text" placeholder="2201024 atau nama@kampus.ac.id" value="2201024" required />
                </label>

                <label class="field password-field">
                    <span>Kata Sandi <b>*</b></span>
                    <input type="password" value="secretpassword" required />
                </label>

                <div class="login-options">
                    <label>
                        <input type="checkbox" checked />
                        <span>Ingat saya</span>
                    </label>
                    <button type="button">Lupa kata sandi?</button>
                </div>

                <button type="submit" class="btn btn-primary">
                    Masuk ke Sistem <x-icon name="arrow" :size="16" />
                </button>

                <small>Dengan masuk, kamu menyetujui Ketentuan Penggunaan dan Kebijakan Privasi institusi.</small>
            </form>

            <span class="copyright">© 2025 Program Studi Rekayasa Perangkat Lunak. Hak cipta dilindungi.</span>
        </main>
    </div>
</body>
</html>
