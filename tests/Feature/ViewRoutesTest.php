<?php

namespace Tests\Feature;

use Tests\TestCase;

class ViewRoutesTest extends TestCase
{
    public function test_react_home_view_is_successful(): void
    {
        $response = $this->get('/');
        $response->assertStatus(302);
        $response->assertRedirect('/mahasiswa/dashboard');
    }

    public function test_mahasiswa_dashboard_view_is_successful(): void
    {
        $response = $this->get('/mahasiswa/dashboard');
        $response->assertStatus(200);
        $response->assertSee('Sistem Informasi RPL');
        // $response->assertSee('Halo, Alya Rahmadani'); // Need to check if this string still exists in the view
    }

    public function test_mahasiswa_letters_views_are_successful(): void
    {
        $this->get('/mahasiswa/pengajuan-surat')->assertStatus(200)->assertSee('Layanan Pengajuan Surat');
    }

    public function test_mahasiswa_resources_and_history_views_are_successful(): void
    {
        // $this->get('/mahasiswa/peminjaman')->assertStatus(200)->assertSee('Peminjaman Barang & Ruangan');
        $this->get('/mahasiswa/riwayat-pengajuan')->assertStatus(200)->assertSee('Riwayat Pengajuan');
        $this->get('/mahasiswa/riwayat-peminjaman')->assertStatus(200)->assertSee('Riwayat Peminjaman');
    }

    public function test_blade_admin_views_are_successful(): void
    {
        $this->get('/admin/dashboard')->assertStatus(200)->assertSee('Dashboard Admin');
        $this->get('/admin/data-surat')->assertStatus(200)->assertSee('Data Pengajuan Surat');
        $this->get('/admin/manajemen-barang-ruangan')->assertStatus(200)->assertSee('Manajemen Barang & Ruangan');
        $this->get('/admin/jadwal')->assertStatus(200)->assertSee('Jadwal');
    }

    public function test_blade_additional_views_are_successful(): void
    {
        $this->get('/mahasiswa/notifikasi')->assertStatus(200)->assertSee('Notifikasi');
        $this->get('/mahasiswa/pengaturan')->assertStatus(200)->assertSee('Pengaturan akun');
        // $this->get('/admin/komponen-ui')->assertStatus(200)->assertSee('Komponen UI');
        $this->get('/mahasiswa/login')->assertStatus(200)->assertSee('Masuk');
    }
}
