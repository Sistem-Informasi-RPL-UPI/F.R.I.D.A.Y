<?php

use App\Http\Middleware\EnsureAdminRole;
use App\Modules\Loans\Http\Controllers\ItemLoanController;
use App\Modules\Loans\Http\Controllers\RoomLoanController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('loans')->name('loans.')->group(function (): void {
    Route::get('/rooms', [RoomLoanController::class, 'index'])->name('rooms.index');
    Route::post('/rooms', [RoomLoanController::class, 'store'])->name('rooms.store');
    Route::post('/rooms/{roomLoan}/cancel', [RoomLoanController::class, 'cancel'])->name('rooms.cancel');

    Route::get('/items', [ItemLoanController::class, 'index'])->name('items.index');
    Route::post('/items', [ItemLoanController::class, 'store'])->name('items.store');

    Route::middleware(EnsureAdminRole::class)->group(function (): void {
        Route::post('/rooms/{roomLoan}/review', [RoomLoanController::class, 'review'])->name('rooms.review');
        Route::post('/items/{itemLoan}/review', [ItemLoanController::class, 'review'])->name('items.review');
        Route::post('/items/{itemLoan}/return', [ItemLoanController::class, 'markReturned'])->name('items.return');
    });
});
