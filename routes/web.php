<?php

use App\Http\Controllers\CampusDirectoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
|
*/

// React SPA (1:1 with Figma Make Prototype)
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Data dinamis peminjaman ruangan (gedung, denah, ruangan)
Route::prefix('api/campus')->name('campus.')->group(function () {
    Route::get('/layout', [CampusDirectoryController::class, 'layout'])->name('layout');
    Route::get('/rooms', [CampusDirectoryController::class, 'rooms'])->name('rooms');
});

// Laravel Blade Version Routes
Route::prefix('blade')->name('blade.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('blade.dashboard');
    });

    Route::get('/dashboard', function () {
        return view('pages.dashboard');
    })->name('dashboard');

    Route::get('/letters', function () {
        return view('pages.letters');
    })->name('letters');

    Route::get('/letters/create', function () {
        return view('pages.letter-form');
    })->name('letters.create');

    Route::get('/letters/detail', function () {
        return view('pages.letter-detail');
    })->name('letters.detail');

    Route::get('/resources', function () {
        return view('pages.resources');
    })->name('resources');

    Route::get('/history/letters', function () {
        return view('pages.history-letters');
    })->name('history.letters');

    Route::get('/history/loans', function () {
        return view('pages.history-loans');
    })->name('history.loans');

    Route::get('/admin', function () {
        return view('pages.admin-dashboard');
    })->name('admin.dashboard');

    Route::get('/admin/letters', function () {
        return view('pages.admin-letters');
    })->name('admin.letters');

    Route::get('/admin/resources', function () {
        return view('pages.admin-resources');
    })->name('admin.resources');

    Route::get('/admin/schedule', function () {
        return view('pages.admin-schedule');
    })->name('admin.schedule');

    Route::get('/notifications', function () {
        return view('pages.notifications');
    })->name('notifications');

    Route::get('/settings', function () {
        return view('pages.settings');
    })->name('settings');

    Route::get('/components', function () {
        return view('pages.components');
    })->name('components');

    Route::get('/login', function () {
        return view('pages.login');
    })->name('login');
});
