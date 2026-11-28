<?php

use App\Modules\MataKuliah\Http\Controllers\MataKuliahController;
use Illuminate\Support\Facades\Route;

Route::prefix('mata-kuliah')->name('mata-kuliah.')->group(function (): void {
    Route::get('/', [MataKuliahController::class, 'index'])->name('index');
    Route::post('/', [MataKuliahController::class, 'store'])->name('store');
    Route::post('/impor', [MataKuliahController::class, 'import'])->name('import');
    Route::put('/{id}', [MataKuliahController::class, 'update'])->whereNumber('id')->name('update');
    Route::delete('/{id}', [MataKuliahController::class, 'destroy'])->whereNumber('id')->name('destroy');
    Route::delete('/', [MataKuliahController::class, 'clearAll'])->name('clear');
});
