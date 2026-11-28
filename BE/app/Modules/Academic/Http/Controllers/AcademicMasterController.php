<?php

namespace App\Modules\Academic\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicPeriod;
use App\Modules\Academic\Models\Course;
use App\Modules\Academic\Models\Lecturer;
use App\Modules\Academic\Models\StudentClass;
use App\Modules\Academic\Models\StudyProgram;
use App\Modules\Academic\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicMasterController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'study_programs' => StudyProgram::query()->orderBy('code')->get(),
                'academic_periods' => AcademicPeriod::query()->orderByDesc('start_date')->get(),
                'lecturers' => Lecturer::query()->with('studyProgram')->orderBy('name')->get(),
                'courses' => Course::query()->with('studyProgram')->orderBy('code')->get(),
                'student_classes' => StudentClass::query()->with('studyProgram')->orderBy('name')->get(),
                'time_slots' => TimeSlot::query()->orderBy('day_of_week')->orderBy('slot_order')->get(),
            ],
        ]);
    }

    public function storeStudyProgram(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:16', 'unique:study_programs,code'],
            'name' => ['required', 'string', 'max:120'],
            'degree' => ['string', 'max:16'],
            'color_hex' => ['string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        return response()->json(['data' => StudyProgram::query()->create($data)], 201);
    }

    public function storePeriod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:24', 'unique:academic_periods,code'],
            'name' => ['required', 'string', 'max:100'],
            'semester' => ['required', 'in:ganjil,genap,antara'],
            'academic_year' => ['required', 'string', 'max:16'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_active' => ['boolean'],
        ]);

        return response()->json(['data' => AcademicPeriod::query()->create($data)], 201);
    }

    public function storeLecturer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'nip' => ['required', 'string', 'max:32', 'unique:lecturers,nip'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:120'],
            'preferred_days' => ['nullable', 'array'],
            'max_sks_per_day' => ['integer', 'min:2', 'max:16'],
        ]);

        return response()->json(['data' => Lecturer::query()->create($data)], 201);
    }

    public function storeCourse(Request $request): JsonResponse
    {
        $data = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'code' => ['required', 'string', 'max:24', 'unique:courses,code'],
            'name' => ['required', 'string', 'max:150'],
            'sks' => ['integer', 'min:1', 'max:8'],
            'semester_level' => ['integer', 'min:1', 'max:14'],
            'requires_lab' => ['boolean'],
        ]);

        return response()->json(['data' => Course::query()->create($data)], 201);
    }

    public function storeStudentClass(Request $request): JsonResponse
    {
        $data = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'name' => ['required', 'string', 'max:32'],
            'cohort_year' => ['required', 'integer', 'min:2015', 'max:2100'],
            'student_count' => ['integer', 'min:1', 'max:300'],
        ]);

        return response()->json(['data' => StudentClass::query()->create($data)], 201);
    }

    public function storeTimeSlot(Request $request): JsonResponse
    {
        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:1', 'max:6'],
            'slot_order' => ['required', 'integer', 'min:1', 'max:20'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'label' => ['required', 'string', 'max:48'],
            'is_break' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        return response()->json(['data' => TimeSlot::query()->create($data)], 201);
    }
}
