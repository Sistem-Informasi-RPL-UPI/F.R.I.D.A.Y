<?php

use App\Modules\Ruangan\Http\Controllers\RuanganController;
use Illuminate\Support\Facades\Route;

Route::get('/ruangan', [RuanganController::class, 'index'])->name('ruangan.index');
