<x-layouts.app pageTitle="Formulir Pengajuan Surat" activePage="letters" role="student">
    <div class="page narrow">
        <a href="{{ route('blade.letters') }}" class="back">
            Layanan Pengajuan Surat <x-icon name="chevron" :size="15" /> Formulir Pengajuan
        </a>
        <div class="page-intro">
            <div>
                <h1>Formulir Pengajuan Surat</h1>
                <p>Surat Pengantar Magang · Lengkapi informasi dan dokumen di bawah ini.</p>
            </div>
        </div>

        <div class="steps">
            <div class="done current">
                <span>1</span>
                <strong>Data Pengajuan</strong>
                <i></i>
            </div>
            <div>
                <span>2</span>
                <strong>Dokumen</strong>
                <i></i>
            </div>
            <div>
                <span>3</span>
                <strong>Konfirmasi</strong>
            </div>
        </div>

        <section class="form-panel">
            <div class="section-head">
                <span>01</span>
                <div>
                    <h2>Informasi Mahasiswa</h2>
                    <p>Data berikut disesuaikan dengan akun akademikmu.</p>
                </div>
            </div>
            <div class="form-grid">
                <label class="field">
                    <span>Nama Lengkap <b>*</b></span>
                    <input type="text" value="Alya Rahmadani" readonly />
                </label>
                <label class="field">
                    <span>Nomor Induk Mahasiswa <b>*</b></span>
                    <input type="text" value="2201024" readonly />
                </label>
                <label class="field">
                    <span>Program Studi</span>
                    <input type="text" value="Rekayasa Perangkat Lunak" readonly />
                </label>
                <label class="field">
                    <span>Email Mahasiswa</span>
                    <input type="text" value="alya.rahmadani@kampus.ac.id" readonly />
                </label>
            </div>
        </section>

        <section class="form-panel">
            <div class="section-head">
                <span>02</span>
                <div>
                    <h2>Detail Pengajuan</h2>
                    <p>Berikan informasi yang sesuai dengan kebutuhan surat.</p>
                </div>
            </div>
            <div class="form-grid">
                <label class="field">
                    <span>Nama Perusahaan / Instansi <b>*</b></span>
                    <input type="text" placeholder="Contoh: PT Teknologi Nusantara" required />
                </label>
                <label class="field">
                    <span>Alamat Perusahaan / Instansi <b>*</b></span>
                    <input type="text" placeholder="Masukkan alamat lengkap" required />
                </label>
                <label class="field">
                    <span>Tanggal Mulai Magang <b>*</b></span>
                    <input type="date" required />
                </label>
                <label class="field">
                    <span>Tanggal Selesai Magang <b>*</b></span>
                    <input type="date" required />
                </label>
                <label class="field">
                    <span>Tujuan Pengajuan <b>*</b></span>
                    <select>
                        <option>Keperluan magang mandiri</option>
                        <option>Program MBKM</option>
                        <option>Kerja praktik</option>
                    </select>
                </label>
                <label class="field full">
                    <span>Catatan tambahan</span>
                    <textarea placeholder="Tambahkan informasi lain yang perlu diketahui admin..." rows="4"></textarea>
                </label>
            </div>
        </section>

        <section class="form-panel">
            <div class="section-head">
                <span>03</span>
                <div>
                    <h2>Dokumen Persyaratan</h2>
                    <p>Format PDF/JPG/PNG, ukuran maksimal 5 MB per berkas.</p>
                </div>
            </div>
            <div class="checklist">
                <span><x-icon name="check" :size="16" /> Proposal magang</span>
                <span><x-icon name="check" :size="16" /> Bukti penerimaan atau informasi perusahaan</span>
            </div>
            <label class="upload">
                <input type="file" />
                <span class="upload-icon">
                    <x-icon name="upload" />
                </span>
                <strong>Seret berkas ke sini atau <u>pilih dari perangkat</u></strong>
                <small>Pastikan dokumen jelas dan tidak dilindungi kata sandi</small>
            </label>
        </section>

        <div class="form-footer">
            <a href="{{ route('blade.letters') }}" class="btn btn-ghost">Batal</a>
            <div>
                <button type="button" class="btn btn-outline">Simpan Draft</button>
                <a href="{{ route('blade.history.letters') }}" class="btn btn-primary">
                    Kirim Pengajuan <x-icon name="arrow" :size="16" />
                </a>
            </div>
        </div>
    </div>
</x-layouts.app>
