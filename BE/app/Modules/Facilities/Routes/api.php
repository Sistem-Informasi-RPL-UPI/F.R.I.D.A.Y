<?php

use App\Http\Middleware\EnsureAdminRole;
use App\Modules\Facilities\Http\Controllers\BuildingController;
use App\Modules\Facilities\Http\Controllers\ItemController;
use App\Modules\Facilities\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('facilities')->name('facilities.')->group(function (): void {
    Route::get('/buildings', [BuildingController::class, 'index'])->name('buildings.index');
    Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::get('/items', [ItemController::class, 'index'])->name('items.index');

    Route::middleware(EnsureAdminRole::class)->group(function (): void {
        Route::post('/buildings', [BuildingController::class, 'store'])->name('buildings.store');
        Route::patch('/buildings/{building}', [BuildingController::class, 'update'])->name('buildings.update');
        Route::delete('/buildings/{building}', [BuildingController::class, 'destroy'])->name('buildings.destroy');

        Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
        Route::patch('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::patch('/items/{item}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');
    });
});
