<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Academic
 * Master academic entities and time slot configuration for scheduling.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_programs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->string('name', 120);
            $table->string('degree', 16)->default('S1'); // S1, S2, D3
            $table->string('color_hex', 7)->default('#0101B7'); // Used in Mind Mapping legend
            $table->timestamps();
        });

        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 24)->unique(); // e.g., 2026-1
            $table->string('name', 100);
            $table->string('semester', 16); // ganjil, genap, antara
            $table->string('academic_year', 16); // e.g., 2026/2027
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('lecturers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
            $table->string('nip', 32)->unique();
            $table->string('name', 120);
            $table->string('email', 120)->nullable();
            $table->json('preferred_days')->nullable(); // Soft constraint: preferred days [1..6]
            $table->unsignedTinyInteger('max_sks_per_day')->default(8);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_program_id')->constrained('study_programs')->cascadeOnDelete();
            $table->string('code', 24)->unique();
            $table->string('name', 150);
            $table->unsignedTinyInteger('sks')->default(2);
            $table->unsignedTinyInteger('semester_level')->default(1);
            $table->boolean('requires_lab')->default(false);
            $table->timestamps();
        });

        Schema::create('student_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_program_id')->constrained('study_programs')->cascadeOnDelete();
            $table->string('name', 32); // e.g., 5A, 5B
            $table->unsignedSmallInteger('cohort_year');
            $table->unsignedSmallInteger('student_count')->default(35);
            $table->timestamps();

            $table->unique(['study_program_id', 'name', 'cohort_year']);
        });

        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('day_of_week'); // 1=Senin .. 6=Sabtu
            $table->unsignedTinyInteger('slot_order');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('label', 48); // e.g., 07:00 - 07:50
            $table->boolean('is_break')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['day_of_week', 'slot_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_slots');
        Schema::dropIfExists('student_classes');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('lecturers');
        Schema::dropIfExists('academic_periods');
        Schema::dropIfExists('study_programs');
    }
};
