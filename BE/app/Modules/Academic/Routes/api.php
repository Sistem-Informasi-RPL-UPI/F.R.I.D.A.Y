<?php

use App\Http\Middleware\EnsureAdminRole;
use App\Modules\Academic\Http\Controllers\AcademicMasterController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('academic')->name('academic.')->group(function (): void {
    Route::get('/overview', [AcademicMasterController::class, 'overview'])->name('overview');

    Route::middleware(EnsureAdminRole::class)->group(function (): void {
        Route::post('/study-programs', [AcademicMasterController::class, 'storeStudyProgram'])->name('study-programs.store');
        Route::post('/periods', [AcademicMasterController::class, 'storePeriod'])->name('periods.store');
        Route::post('/lecturers', [AcademicMasterController::class, 'storeLecturer'])->name('lecturers.store');
        Route::post('/courses', [AcademicMasterController::class, 'storeCourse'])->name('courses.store');
        Route::post('/classes', [AcademicMasterController::class, 'storeStudentClass'])->name('classes.store');
        Route::post('/time-slots', [AcademicMasterController::class, 'storeTimeSlot'])->name('time-slots.store');
    });
});
