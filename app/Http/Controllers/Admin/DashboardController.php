<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function dashboard(): View
    {
        return view('pages.admin.admin-dashboard');
    }

    public function letters(): View
    {
        return view('pages.admin.admin-letters');
    }

    public function resources(): View
    {
        return view('pages.admin.admin-resources');
    }

    public function schedule(): View
    {
        return view('pages.admin.admin-schedule');
    }

    public function mindMapping(): View
    {
        return view('pages.admin.admin-mind-mapping');
    }
}
