<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\CampusDirectoryController;
use App\Http\Controllers\Mahasiswa\DashboardController as MahasiswaDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
|
*/

// React SPA (1:1 with Figma Make Prototype)
Route::get('/', function () {
    return redirect()->route('mahasiswa.dashboard');
})->name('home');

// Direct Mind Mapping Download Endpoints
Route::get('/admin/mind-mapping/download-html', function () {
    $filePath = public_path('mind-mapping-upi-cibiru.html');
    if (! file_exists($filePath)) {
        abort(404, 'File HTML Offline Mind Mapping belum digenerate.');
    }

    return response()->download($filePath, 'MIND_MAPPING_JADWAL_UPI_CIBIRU_2022-2023.html', [
        'Content-Type' => 'text/html',
    ]);
})->name('admin.mind-mapping.download-html');

Route::get('/admin/mind-mapping/download-excel', function () {
    $filePath = public_path('downloads/MAPPING_JADWAL_UPI_CIBIRU_2022-2023.csv');
    if (! file_exists($filePath)) {
        abort(404, 'File Excel CSV Mind Mapping belum digenerate.');
    }

    return response()->download($filePath, 'MAPPING_JADWAL_UPI_CIBIRU_2022-2023.csv', [
        'Content-Type' => 'text/csv; charset=UTF-8',
    ]);
})->name('admin.mind-mapping.download-excel');

Route::get('/admin/schedule/download-template', function () {
    $filePath = public_path('downloads/TEMPLATE_JADWAL_KAPRODI_UPI_CIBIRU.csv');
    if (! file_exists($filePath)) {
        abort(404, 'File Template CSV Kaprodi belum tersedia.');
    }

    return response()->download($filePath, 'TEMPLATE_JADWAL_KAPRODI_UPI_CIBIRU.csv', [
        'Content-Type' => 'text/csv; charset=UTF-8',
    ]);
})->name('admin.schedule.download-template');

// Data dinamis peminjaman ruangan (gedung, denah, ruangan)
Route::prefix('api/campus')->name('campus.')->group(function () {
    Route::get('/layout', [CampusDirectoryController::class, 'layout'])->name('layout');
    Route::get('/rooms', [CampusDirectoryController::class, 'rooms'])->name('rooms');
});

// Mahasiswa Routes
Route::prefix('mahasiswa')->name('mahasiswa.')->group(function () {
    Route::get('/dashboard', [MahasiswaDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('/pengajuan-surat', [MahasiswaDashboardController::class, 'letters'])->name('surat');
    Route::get('/surat/create', [MahasiswaDashboardController::class, 'createLetter'])->name('surat.create');
    Route::get('/surat/detail', [MahasiswaDashboardController::class, 'detailLetter'])->name('surat.detail');
    Route::get('/peminjaman', [MahasiswaDashboardController::class, 'resources'])->name('peminjaman');
    Route::get('/riwayat-pengajuan', [MahasiswaDashboardController::class, 'historyLetters'])->name('riwayat-pengajuan');
    Route::get('/riwayat-peminjaman', [MahasiswaDashboardController::class, 'historyLoans'])->name('riwayat-peminjaman');
    Route::get('/notifikasi', [MahasiswaDashboardController::class, 'notifications'])->name('notifikasi');
    Route::get('/pengaturan', [MahasiswaDashboardController::class, 'settings'])->name('pengaturan');
    Route::get('/login', [MahasiswaDashboardController::class, 'login'])->name('login');
});

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('/data-surat', [AdminDashboardController::class, 'letters'])->name('data-surat');
    Route::get('/data-peminjaman', [AdminDashboardController::class, 'letters'])->name('data-peminjaman'); // Placeholder
    Route::get('/manajemen-barang-ruangan', [AdminDashboardController::class, 'resources'])->name('manajemen-barang-ruangan');
    Route::get('/jadwal', [AdminDashboardController::class, 'schedule'])->name('jadwal');
    Route::get('/mind-mapping', [AdminDashboardController::class, 'mindMapping'])->name('mind-mapping');
    Route::get('/komponen-ui', [AdminDashboardController::class, 'komponenUi'])->name('komponen-ui');
});
