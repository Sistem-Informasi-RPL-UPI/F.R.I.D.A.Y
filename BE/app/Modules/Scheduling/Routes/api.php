<?php

use App\Http\Middleware\EnsureAdminRole;
use App\Modules\Scheduling\Http\Controllers\MindMappingController;
use App\Modules\Scheduling\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('scheduling')->name('scheduling.')->group(function (): void {
    Route::get('/requirements', [ScheduleController::class, 'requirements'])->name('requirements.index');
    Route::get('/runs', [ScheduleController::class, 'runs'])->name('runs.index');
    Route::get('/mind-mapping', [MindMappingController::class, 'show'])->name('mind-mapping.show');
    Route::get('/mind-mapping/export-html', [MindMappingController::class, 'exportHtml'])->name('mind-mapping.export');

    Route::middleware(EnsureAdminRole::class)->group(function (): void {
        Route::post('/requirements', [ScheduleController::class, 'storeRequirement'])->name('requirements.store');
        Route::post('/generate', [ScheduleController::class, 'generate'])->name('generate');
        Route::post('/runs/{scheduleRun}/validate', [ScheduleController::class, 'validateRun'])->name('runs.validate');
        Route::post('/runs/{scheduleRun}/approve', [ScheduleController::class, 'approve'])->name('runs.approve');
    });
});
