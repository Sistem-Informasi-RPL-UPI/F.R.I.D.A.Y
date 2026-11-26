<?php

namespace Tests\Feature;

use Tests\TestCase;

class MindMappingTest extends TestCase
{
    /**
     * Test blade admin mind mapping page loads successfully.
     */
    public function test_admin_mind_mapping_blade_page_loads_successfully(): void
    {
        $response = $this->get('/admin/komponen-ui');

        $response->assertStatus(200);
        $response->assertSee('Mind Mapping Jadwal Perkuliahan');
        $response->assertSee('UPI Kampus Cibiru');
    }

    /**
     * Test admin can download self-contained offline HTML file.
     */
    public function test_admin_can_download_offline_html_file(): void
    {
        $response = $this->get('/admin/mind-mapping/download-html');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    /**
     * Test admin can download Excel CSV mapping file.
     */
    public function test_admin_can_download_excel_csv_mapping_file(): void
    {
        $response = $this->get('/admin/mind-mapping/download-excel');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    /**
     * Test admin can download Kaprodi CSV template file.
     */
    public function test_admin_can_download_kaprodi_template_csv(): void
    {
        $response = $this->get('/admin/schedule/download-template');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $content = $response->streamedContent();
        $this->assertStringContainsString('Hari_Khusus_Dosen', $content);
        $this->assertStringContainsString('Program_Studi', $content);
        $this->assertStringContainsString('PETUNJUK PENGISIAN TEMPLATE KAPRODI', $content);
    }

    /**
     * Test admin schedule blade page displays integrator banner.
     */
    public function test_admin_schedule_blade_page_displays_integrator_banner(): void
    {
        $response = $this->get('/admin/jadwal');

        $response->assertStatus(200);
        $response->assertSee('Integrasi Template Kaprodi &amp; Mind Mapping Generator', false);
        $response->assertSee('Prioritas SKS Matkul Terbanyak');
        $response->assertSee('Unduh Template Kaprodi (CSV)');
    }

    /**
     * Test that offline HTML is completely self-contained with no external links.
     */
    public function test_offline_html_is_self_contained(): void
    {
        $filePath = public_path('mind-mapping-upi-cibiru.html');
        $this->assertFileExists($filePath);

        $html = file_get_contents($filePath);
        $this->assertStringContainsString('MIND MAPPING JADWAL PERKULIAHAN', $html);
        $this->assertStringContainsString('UPI KAMPUS CIBIRU', $html);
        $this->assertStringNotContainsString('googleapis.com', $html);
        $this->assertStringNotContainsString('cdnjs.cloudflare.com', $html);
        $this->assertStringNotContainsString('cdn.jsdelivr.net', $html);
    }
}
