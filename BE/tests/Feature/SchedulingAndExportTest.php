<?php

use App\Models\User;
use App\Modules\Academic\Models\AcademicPeriod;
use App\Modules\Academic\Models\Course;
use App\Modules\Academic\Models\Lecturer;
use App\Modules\Academic\Models\StudentClass;
use App\Modules\Academic\Models\StudyProgram;
use App\Modules\Academic\Models\TimeSlot;
use App\Modules\Facilities\Models\Building;
use App\Modules\Facilities\Models\Room;
use App\Modules\Scheduling\Models\ScheduleRequirement;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('generates, validates, approves schedule and exports self-contained offline html', function () {
    $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

    $building = Building::query()->create(['code' => 'GD-B', 'name' => 'Gedung B']);
    Room::query()->create([
        'building_id' => $building->id,
        'code' => 'B-201',
        'name' => 'Lab Komputer',
        'capacity' => 40,
        'room_type' => 'lab',
        'is_schedulable' => true,
    ]);

    $prodi = StudyProgram::query()->create(['code' => 'RPL', 'name' => 'Rekayasa Perangkat Lunak', 'color_hex' => '#0101B7']);
    $period = AcademicPeriod::query()->create([
        'code' => '2026-1',
        'name' => 'Ganjil 2026/2027',
        'semester' => 'ganjil',
        'academic_year' => '2026/2027',
        'start_date' => '2026-09-01',
        'end_date' => '2027-01-31',
        'is_active' => true,
    ]);
    $lecturer = Lecturer::query()->create([
        'study_program_id' => $prodi->id,
        'nip' => '199001012020011001',
        'name' => 'Dr. Andi',
        'preferred_days' => [1],
    ]);
    $course = Course::query()->create([
        'study_program_id' => $prodi->id,
        'code' => 'RPL301',
        'name' => 'Verifikasi dan Validasi',
        'sks' => 3,
        'requires_lab' => true,
    ]);
    $class = StudentClass::query()->create([
        'study_program_id' => $prodi->id,
        'name' => '5A',
        'cohort_year' => 2024,
        'student_count' => 35,
    ]);

    TimeSlot::query()->create([
        'day_of_week' => 1,
        'slot_order' => 1,
        'start_time' => '07:00',
        'end_time' => '07:50',
        'label' => '07:00 - 07:50',
    ]);
    TimeSlot::query()->create([
        'day_of_week' => 1,
        'slot_order' => 2,
        'start_time' => '07:50',
        'end_time' => '08:40',
        'label' => '07:50 - 08:40',
    ]);

    ScheduleRequirement::query()->create([
        'academic_period_id' => $period->id,
        'course_id' => $course->id,
        'lecturer_id' => $lecturer->id,
        'student_class_id' => $class->id,
        'preferred_room_type' => 'lab',
        'required_capacity' => 35,
        'sessions_per_week' => 1,
        'duration_slots' => 2,
    ]);

    $runId = $this->actingAs($admin)
        ->postJson('/api/v1/scheduling/generate', ['academic_period_id' => $period->id])
        ->assertCreated()
        ->assertJsonPath('data.hard_conflicts_count', 0)
        ->json('data.id');

    $this->actingAs($admin)
        ->postJson("/api/v1/scheduling/runs/{$runId}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->actingAs($admin)
        ->getJson('/api/v1/scheduling/mind-mapping')
        ->assertOk()
        ->assertJsonPath('data.buildings.0.code', 'GD-B');

    $htmlResponse = $this->actingAs($admin)
        ->get('/api/v1/scheduling/mind-mapping/export-html')
        ->assertOk();

    $html = $htmlResponse->getContent();
    expect($html)->toContain('const DATASET =')
        ->not->toContain('https://')
        ->not->toContain('http://');
});
