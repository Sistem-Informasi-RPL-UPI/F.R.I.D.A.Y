<x-layouts.app pageTitle="Manajemen Barang & Ruangan" activePage="admin-resources" role="admin">
    <div class="page">
        <div class="page-intro">
            <div>
                <h1>Manajemen Barang & Ruangan</h1>
                <p>Kelola data, status, dan ketersediaan seluruh fasilitas laboratorium.</p>
            </div>
            <button type="button" class="btn btn-primary">
                <x-icon name="plus" /> Tambah Resource
            </button>
        </div>

        <div class="toolbar">
            <label class="search">
                <x-icon name="search" />
                <input placeholder="Cari resource laboratorium..." />
            </label>
        </div>

        <section class="panel">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Resource</th>
                            <th>Kategori</th>
                            <th>Lokasi</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Kamera Sony Alpha A6400</strong>
                                <small class="cell-sub">Peralatan Multimedia</small>
                            </td>
                            <td>Peralatan Multimedia</td>
                            <td>Lab Multimedia</td>
                            <td><x-badge tone="success">Tersedia (3/5)</x-badge></td>
                            <td><button type="button" class="btn btn-outline">Edit</button></td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Kit Internet of Things</strong>
                                <small class="cell-sub">Peralatan Praktikum</small>
                            </td>
                            <td>Peralatan Praktikum</td>
                            <td>Lab IoT</td>
                            <td><x-badge tone="danger">Dipinjam (0/8)</x-badge></td>
                            <td><button type="button" class="btn btn-outline">Edit</button></td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Laboratorium RPL (B.01.004)</strong>
                                <small class="cell-sub">Ruang Praktikum</small>
                            </td>
                            <td>Ruangan</td>
                            <td>Gedung Biru, Lantai 1</td>
                            <td><x-badge tone="success">Tersedia</x-badge></td>
                            <td><button type="button" class="btn btn-outline">Edit</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-layouts.app>
