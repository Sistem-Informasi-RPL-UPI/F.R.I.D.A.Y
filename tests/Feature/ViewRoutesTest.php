<?php

namespace Tests\Feature;

use Tests\TestCase;

class ViewRoutesTest extends TestCase
{
    public function test_react_home_view_is_successful(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('<div id="root"></div>', false);
    }

    public function test_blade_dashboard_view_is_successful(): void
    {
        $response = $this->get('/blade/dashboard');
        $response->assertStatus(200);
        $response->assertSee('Sistem Informasi RPL');
        $response->assertSee('Halo, Alya Rahmadani');
    }

    public function test_blade_letters_views_are_successful(): void
    {
        $this->get('/blade/letters')->assertStatus(200)->assertSee('Layanan Pengajuan Surat');
        $this->get('/blade/letters/create')->assertStatus(200)->assertSee('Formulir Pengajuan Surat');
        $this->get('/blade/letters/detail')->assertStatus(200)->assertSee('Surat Pengantar Magang');
    }

    public function test_blade_resources_and_history_views_are_successful(): void
    {
        $this->get('/blade/resources')->assertStatus(200)->assertSee('Peminjaman Barang & Ruangan');
        $this->get('/blade/history/letters')->assertStatus(200)->assertSee('Riwayat Pengajuan Surat');
        $this->get('/blade/history/loans')->assertStatus(200)->assertSee('Riwayat Peminjaman');
    }

    public function test_blade_admin_views_are_successful(): void
    {
        $this->get('/blade/admin')->assertStatus(200)->assertSee('Dashboard Admin');
        $this->get('/blade/admin/letters')->assertStatus(200)->assertSee('Data Pengajuan Surat');
        $this->get('/blade/admin/resources')->assertStatus(200)->assertSee('Manajemen Barang & Ruangan');
        $this->get('/blade/admin/schedule')->assertStatus(200)->assertSee('Jadwal & Ketersediaan');
    }

    public function test_blade_additional_views_are_successful(): void
    {
        $this->get('/blade/notifications')->assertStatus(200)->assertSee('Notifikasi');
        $this->get('/blade/settings')->assertStatus(200)->assertSee('Pengaturan Akun');
        $this->get('/blade/components')->assertStatus(200)->assertSee('Komponen UI');
        $this->get('/blade/login')->assertStatus(200)->assertSee('Masuk ke Akun');
    }
}
