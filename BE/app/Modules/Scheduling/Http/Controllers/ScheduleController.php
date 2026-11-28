<?php

namespace App\Modules\Scheduling\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Scheduling\Models\ScheduleRequirement;
use App\Modules\Scheduling\Models\ScheduleRun;
use App\Modules\Scheduling\Services\ScheduleGeneratorService;
use App\Modules\Scheduling\Services\ScheduleValidatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function requirements(Request $request): JsonResponse
    {
        $query = ScheduleRequirement::query()
            ->with(['academicPeriod', 'course.studyProgram', 'lecturer', 'studentClass']);

        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->integer('academic_period_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function storeRequirement(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'lecturer_id' => ['required', 'exists:lecturers,id'],
            'student_class_id' => ['required', 'exists:student_classes,id'],
            'preferred_room_type' => ['string', 'in:kelas,lab,aula,rapat'],
            'required_capacity' => ['integer', 'min:1', 'max:1000'],
            'sessions_per_week' => ['integer', 'min:1', 'max:6'],
            'duration_slots' => ['integer', 'min:1', 'max:8'],
            'notes' => ['nullable', 'string'],
        ]);

        $requirement = ScheduleRequirement::query()->create($data)
            ->load(['academicPeriod', 'course', 'lecturer', 'studentClass']);

        return response()->json(['data' => $requirement], 201);
    }

    public function runs(): JsonResponse
    {
        return response()->json([
            'data' => ScheduleRun::query()
                ->with(['academicPeriod'])
                ->withCount('entries')
                ->latest()
                ->get(),
        ]);
    }

    public function generate(Request $request, ScheduleGeneratorService $generator): JsonResponse
    {
        $data = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
        ]);

        $run = $generator->generate($data['academic_period_id'], $request->user()->id);

        return response()->json(['data' => $run], 201);
    }

    public function validateRun(ScheduleRun $scheduleRun, ScheduleValidatorService $validator): JsonResponse
    {
        $result = $validator->validate($scheduleRun);

        return response()->json([
            'data' => [
                'schedule_run' => $scheduleRun->fresh(),
                'validation' => $result,
            ],
        ]);
    }

    public function approve(Request $request, ScheduleRun $scheduleRun, ScheduleValidatorService $validator): JsonResponse
    {
        $validation = $validator->validate($scheduleRun);

        if ($validation['hard_conflicts'] > 0) {
            return response()->json([
                'message' => 'Cannot approve schedule run while hard conflicts remain.',
                'code' => 'HARD_CONFLICTS_EXIST',
                'details' => $validation['details'],
            ], 422);
        }

        $scheduleRun->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json(['data' => $scheduleRun->fresh(['academicPeriod'])]);
    }
}
