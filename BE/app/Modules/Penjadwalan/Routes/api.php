<?php

use App\Modules\Penjadwalan\Http\Controllers\PenjadwalanController;
use Illuminate\Support\Facades\Route;

Route::get('/jadwal', [PenjadwalanController::class, 'showJadwal'])->name('jadwal.show');
Route::post('/jadwal/generate', [PenjadwalanController::class, 'generate'])->name('jadwal.generate');
Route::post('/jadwal/swap', [PenjadwalanController::class, 'swap'])->name('jadwal.swap');
Route::put('/mata-kuliah/{id}/jadwal', [PenjadwalanController::class, 'updateCourseSchedule'])
    ->whereNumber('id')
    ->name('mata-kuliah.jadwal.update');
Route::get('/pengaturan-waktu', [PenjadwalanController::class, 'showPengaturanWaktu'])->name('pengaturan-waktu.show');
Route::put('/pengaturan-waktu', [PenjadwalanController::class, 'updatePengaturanWaktu'])->name('pengaturan-waktu.update');
