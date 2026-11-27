<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function dashboard(): View
    {
        return view('pages.mahasiswa.dashboard');
    }

    public function letters(): View
    {
        return view('pages.mahasiswa.letters');
    }

    public function createLetter(): View
    {
        return view('pages.mahasiswa.letter-form');
    }

    public function detailLetter(): View
    {
        return view('pages.mahasiswa.letter-detail');
    }

    public function resources(): View
    {
        return view('pages.mahasiswa.resources');
    }

    public function historyLetters(): View
    {
        return view('pages.mahasiswa.history-letters');
    }

    public function historyLoans(): View
    {
        return view('pages.mahasiswa.history-loans');
    }

    public function notifications(): View
    {
        return view('pages.mahasiswa.notifications');
    }

    public function settings(): View
    {
        return view('pages.mahasiswa.settings');
    }

    public function components(): View
    {
        return view('pages.mahasiswa.components');
    }

    public function login(): View
    {
        return view('pages.mahasiswa.login');
    }
}
