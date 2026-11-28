<?php

use App\Modules\Identity\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('identity.')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:10,1')
        ->name('login');

    Route::middleware('auth')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::patch('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});
