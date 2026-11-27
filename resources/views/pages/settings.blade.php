<x-layouts.app pageTitle="Pengaturan Akun" activePage="settings" role="student">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">PERSONALISASI AKUN</span>
                <h1>Pengaturan Akun</h1>
                <p>Kelola informasi profil, keamanan, dan preferensi layananmu.</p>
            </div>
        </div>

        <section class="profile-banner">
            <div class="profile-decoration one"></div>
            <div class="profile-decoration two"></div>
            <div class="profile-avatar">
                AR
                <span><x-icon name="plus" :size="14" /></span>
            </div>
            <div>
                <span class="eyebrow">MAHASISWA AKTIF</span>
                <h2>Alya Rahmadani</h2>
                <p>2201024 · Rekayasa Perangkat Lunak</p>
            </div>
            <x-badge tone="success">Akun Terverifikasi</x-badge>
        </section>

        <div class="settings-layout">
            <aside class="settings-nav">
                <button type="button" class="active">
                    <span><x-icon name="users" /></span>
                    <div>
                        <strong>Profil</strong>
                        <small>Data diri dan kontak</small>
                    </div>
                    <x-icon name="chevron" :size="17" />
                </button>
                <button type="button">
                    <span><x-icon name="settings" /></span>
                    <div>
                        <strong>Keamanan</strong>
                        <small>Password dan akses</small>
                    </div>
                    <x-icon name="chevron" :size="17" />
                </button>
                <button type="button">
                    <span><x-icon name="bell" /></span>
                    <div>
                        <strong>Notifikasi</strong>
                        <small>Email dan pengingat</small>
                    </div>
                    <x-icon name="chevron" :size="17" />
                </button>
                <button type="button">
                    <span><x-icon name="grid" /></span>
                    <div>
                        <strong>Preferensi</strong>
                        <small>Bahasa dan tampilan</small>
                    </div>
                    <x-icon name="chevron" :size="17" />
                </button>
                <div class="settings-help">
                    <x-icon name="bell" />
                    <strong>Data tidak sesuai?</strong>
                    <p>Hubungi admin akademik untuk perubahan data utama.</p>
                </div>
            </aside>

            <section class="settings-content">
                <div class="settings-head">
                    <div>
                        <h2>Informasi Pribadi</h2>
                        <p>Data utama tersinkronisasi dengan sistem akademik.</p>
                    </div>
                    <x-badge tone="info">Terakhir diperbarui 12 Jun</x-badge>
                </div>
                <div class="form-grid">
                    <label class="field">
                        <span>Nama lengkap</span>
                        <input type="text" value="Alya Rahmadani" readonly />
                    </label>
                    <label class="field">
                        <span>Nomor induk mahasiswa</span>
                        <input type="text" value="2201024" readonly />
                    </label>
                    <label class="field">
                        <span>Program studi</span>
                        <input type="text" value="Rekayasa Perangkat Lunak" readonly />
                    </label>
                    <label class="field">
                        <span>Angkatan</span>
                        <input type="text" value="2022" readonly />
                    </label>
                </div>

                <div class="settings-divider"></div>

                <div class="settings-head">
                    <div>
                        <h2>Informasi Kontak</h2>
                        <p>Digunakan untuk pembaruan layanan penting.</p>
                    </div>
                </div>
                <div class="form-grid">
                    <label class="field">
                        <span>Email institusi</span>
                        <input type="email" value="alya.rahmadani@kampus.ac.id" />
                    </label>
                    <label class="field">
                        <span>Nomor telepon</span>
                        <input type="tel" value="+62 812 3456 7890" />
                    </label>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-outline">Batalkan</button>
                    <button type="button" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </section>
        </div>
    </div>
</x-layouts.app>
