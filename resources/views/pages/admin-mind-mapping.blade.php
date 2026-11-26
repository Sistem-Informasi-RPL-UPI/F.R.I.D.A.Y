<x-layouts.app pageTitle="Mind Mapping Jadwal Perkuliahan" activePage="admin-mind-mapping" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <span class="eyebrow">VISUALISASI MATRIKS JADWAL TERPADU KAMPUS</span>
                <h1>Mind Mapping Jadwal Perkuliahan</h1>
                <p>Visualisasi pemetaan jadwal perkuliahan seluruh program studi UPI Kampus Cibiru sesuai acuan sheet <code>MAPPING</code> Excel referensi.</p>
            </div>
            <div class="intro-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="{{ route('admin.mind-mapping.download-html') }}" class="btn btn-primary" download>
                    <x-icon name="download" /> Unduh HTML Offline (Flashdisk)
                </a>
                <a href="{{ url('/mind-mapping-upi-cibiru.html') }}" target="_blank" class="btn btn-secondary">
                    <x-icon name="arrow" /> Buka Layar Penuh TV (16:9)
                </a>
                <a href="{{ route('admin.mind-mapping.download-excel') }}" class="btn btn-outline">
                    <x-icon name="file" /> Unduh Format Excel
                </a>
            </div>
        </div>

        <!-- 5-Step Validation Card -->
        <section class="panel" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1px solid #bfdbfe; margin-bottom: 24px; padding: 20px; border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="background: #22c55e; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: bold;">&#10003;</span>
                        <h2 style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin: 0;">Status Penjadwalan &amp; Persetujuan Admin</h2>
                    </div>
                    <p style="color: #475569; font-size: 13px; margin: 0;">Seluruh tahapan validasi dan bebas bentrok telah diverifikasi sebelum file Mind Mapping dapat dibuat.</p>
                </div>
                <div style="text-align: right;">
                    <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                        &#10003; DISANGGAR &amp; DISETUJUI ADMIN
                    </span>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Versi: <strong>v1.2.0-approved</strong> &bull; Semester Ganjil 2022/2023</div>
                </div>
            </div>

            <!-- Steps Progress -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 14px;">
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Langkah 1</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">Kebutuhan 5 Prodi</div>
                    <div style="color: #16a34a; font-size: 11px; font-weight: 600;">&#10003; 5/5 Prodi Terkirim</div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Langkah 2</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">Validasi Kurikulum</div>
                    <div style="color: #16a34a; font-size: 11px; font-weight: 600;">&#10003; Lolos Validasi Data</div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Langkah 3</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">Generate Algoritma</div>
                    <div style="color: #16a34a; font-size: 11px; font-weight: 600;">&#10003; 434 Sesi Berhasil</div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Langkah 4</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">Hard Constraints</div>
                    <div style="color: #16a34a; font-size: 11px; font-weight: 600;">&#10003; 0 Konflik / Bentrok</div>
                </div>
                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Langkah 5</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">Persetujuan Admin</div>
                    <div style="color: #16a34a; font-size: 11px; font-weight: 600;">&#10003; Disetujui Final</div>
                </div>
            </div>
        </section>

        <!-- Preview Iframe or Interactive Viewer -->
        <section class="panel" style="padding: 0; overflow: hidden; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="background: #0f172a; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="font-size: 14px; font-weight: 700; color: #38bdf8; margin: 0;">Preview Matriks Kampus (Sheet MAPPING)</h3>
                    <p style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Mencakup Gedung C, D, F, H, I, dan seluruh Laboratorium UPI Kampus Cibiru</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="{{ url('/') }}" class="btn btn-sm btn-primary" style="font-size: 12px; padding: 6px 12px;">
                        Buka di Mode Interaktif React
                    </a>
                    <a href="{{ url('/mind-mapping-upi-cibiru.html') }}" target="_blank" class="btn btn-sm btn-secondary" style="font-size: 12px; padding: 6px 12px;">
                        Layar Penuh TV
                    </a>
                </div>
            </div>
            <iframe src="{{ url('/mind-mapping-upi-cibiru.html') }}" style="width: 100%; height: 750px; border: none; display: block;" title="Preview Mind Mapping Jadwal"></iframe>
        </section>
    </div>
</x-layouts.app>
