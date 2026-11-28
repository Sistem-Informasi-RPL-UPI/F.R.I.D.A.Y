<?php

use App\Modules\Dosen\Http\Controllers\DosenController;
use Illuminate\Support\Facades\Route;

Route::prefix('dosen')->name('dosen.')->group(function (): void {
    Route::get('/', [DosenController::class, 'index'])->name('index');
    Route::post('/', [DosenController::class, 'store'])->name('store');
    Route::post('/impor', [DosenController::class, 'import'])->name('import');
    Route::get('/{kode}/ketersediaan', [DosenController::class, 'showKetersediaan'])->name('ketersediaan.show');
    Route::put('/{kode}/ketersediaan', [DosenController::class, 'updateKetersediaan'])->name('ketersediaan.update');
    Route::put('/{kode}', [DosenController::class, 'update'])->name('update');
    Route::delete('/{kode}', [DosenController::class, 'destroy'])->name('destroy');
});
