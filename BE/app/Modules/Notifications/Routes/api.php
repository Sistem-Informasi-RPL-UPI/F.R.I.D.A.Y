<?php

use App\Modules\Notifications\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function (): void {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::post('/read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
    Route::post('/{id}/read', [NotificationController::class, 'markRead'])->name('read');
});
