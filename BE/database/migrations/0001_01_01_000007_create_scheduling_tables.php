<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Scheduling
 * Schedule requirements, generation runs, conflict checks, and approved entries
 * backing the Mind Mapping matrix and offline HTML export.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('lecturer_id')->constrained('lecturers')->cascadeOnDelete();
            $table->foreignId('student_class_id')->constrained('student_classes')->cascadeOnDelete();
            $table->string('preferred_room_type', 32)->default('kelas');
            $table->unsignedSmallInteger('required_capacity')->default(35);
            $table->unsignedTinyInteger('sessions_per_week')->default(1);
            $table->unsignedTinyInteger('duration_slots')->default(2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('schedule_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->string('status', 24)->default('draft')->index(); // draft, validated, approved, archived
            $table->unsignedInteger('hard_conflicts_count')->default(0);
            $table->decimal('soft_score', 8, 2)->default(0);
            $table->json('summary')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('schedule_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_run_id')->constrained('schedule_runs')->cascadeOnDelete();
            $table->foreignId('schedule_requirement_id')->constrained('schedule_requirements')->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('time_slot_id')->constrained('time_slots')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->unsignedTinyInteger('duration_slots')->default(2);
            $table->boolean('is_locked')->default(false);
            $table->json('conflict_flags')->nullable();
            $table->timestamps();

            $table->index(['schedule_run_id', 'room_id', 'day_of_week']);
            $table->index(['schedule_run_id', 'time_slot_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_entries');
        Schema::dropIfExists('schedule_runs');
        Schema::dropIfExists('schedule_requirements');
    }
};
