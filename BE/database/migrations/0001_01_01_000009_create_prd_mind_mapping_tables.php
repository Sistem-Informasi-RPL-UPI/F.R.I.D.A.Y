<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Modules: Dosen, Ruangan, MataKuliah, Penjadwalan
 * Tables for PRD Mind Mapping Jadwal Perkuliahan 2023/2024 (v1.3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dosen', function (Blueprint $table): void {
            $table->id();
            $table->string('kode', 32)->unique();
            $table->string('nama', 150);
            $table->string('status', 32)->default('Dosen Tetap')->index();
            $table->timestamps();
        });

        Schema::create('ketersediaan_dosen', function (Blueprint $table): void {
            $table->id();
            $table->string('kode_dosen', 32)->unique();
            $table->json('hari');
            $table->string('start_time', 8)->default('07:00');
            $table->string('end_time', 8)->default('18:00');
            $table->boolean('is_custom')->default(false);
            $table->timestamps();

            $table->foreign('kode_dosen')
                ->references('kode')
                ->on('dosen')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });

        Schema::create('ruangan', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->unsignedTinyInteger('urutan')->unique();
            $table->string('kode', 32)->unique();
            $table->string('label', 120);
            $table->string('gedung', 64)->index();
            $table->timestamps();
        });

        Schema::create('mata_kuliah', function (Blueprint $table): void {
            $table->id();
            $table->string('prodi', 64)->index();
            $table->string('kode', 32);
            $table->string('nama', 180);
            $table->unsignedTinyInteger('sks')->default(0);
            $table->string('semester', 16)->default('1');
            $table->string('kelas', 32)->default('A');
            $table->string('kode_dosen_1', 32)->nullable()->index();
            $table->string('kode_dosen_2', 32)->nullable()->index();
            $table->string('raw_dosen_1', 150)->nullable();
            $table->string('raw_dosen_2', 150)->nullable();
            $table->string('kebutuhan_ruang', 64)->default('Ruang Kelas Biasa');
            $table->string('status_antrean', 32)->default('ready')->index();
            $table->string('source_file', 180)->nullable();
            $table->string('parked_reason', 255)->nullable();
            $table->timestamps();

            $table->unique(['prodi', 'kode', 'semester', 'kelas'], 'mk_prodi_kode_sem_kelas_unique');
        });

        Schema::create('jadwal_segmen', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->unsignedTinyInteger('segmen_ke')->default(1);
            $table->string('hari', 16)->index();
            $table->unsignedTinyInteger('ruangan_id')->index();
            $table->unsignedTinyInteger('pos_awal');
            $table->unsignedTinyInteger('panjang');
            $table->timestamps();

            $table->index(['hari', 'ruangan_id', 'pos_awal'], 'jadwal_segmen_slot_idx');
        });

        Schema::create('pengaturan_waktu', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('durasi_sks')->default(50);
            $table->string('mulai_pagi', 8)->default('07:00');
            $table->unsignedSmallInteger('istirahat')->default(60);
            $table->string('mulai_pagi_jumat', 8)->default('07:00');
            $table->string('mulai_siang_jumat', 8)->default('13:00');
            $table->json('last_audit')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_waktu');
        Schema::dropIfExists('jadwal_segmen');
        Schema::dropIfExists('mata_kuliah');
        Schema::dropIfExists('ruangan');
        Schema::dropIfExists('ketersediaan_dosen');
        Schema::dropIfExists('dosen');
    }
};
